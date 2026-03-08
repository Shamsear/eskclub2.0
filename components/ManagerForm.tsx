'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { ImageUpload } from './ui/ImageUpload';
import { RoleType } from '@prisma/client';
import { ErrorMessage } from './FormError';
import { useToast } from './ui/Toast';
import { INDIAN_STATES, INDIAN_STATES_DISTRICTS } from '@/lib/data/indian-states-districts';
import { COUNTRIES } from '@/lib/data/countries';

// Validation schema
const managerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email("Invalid email format").max(100, "Email must be 100 characters or less").optional()
  ),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  dateOfBirth: z.string().optional(),
  photo: z.string().max(255, "Photo URL must be 255 characters or less").optional(),
  roles: z.array(z.nativeEnum(RoleType)), // PLAYER role will be added automatically
});

interface ManagerFormProps {
  clubId: number;
  initialData?: {
    id?: number;
    name: string;
    email: string;
    phone?: string | null;
    place?: string | null;
    dateOfBirth?: string | null;
    photo?: string | null;
    roles?: Array<{ role: RoleType }>;
  };
  mode: 'create' | 'edit';
  preSelectedRoles?: RoleType[];
  returnPath?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  district?: string;
  dateOfBirth?: string;
  photo?: string;
  roles?: string;
  submit?: string;
}

export function ManagerForm({ clubId, initialData, mode, preSelectedRoles, returnPath }: ManagerFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Extract roles from initialData or use preSelectedRoles
  const initialRoles = initialData?.roles?.map(r => r.role) || preSelectedRoles || [RoleType.MANAGER, RoleType.PLAYER];
  
  // Parse initial place data (format: "District, State")
  const parsePlace = (place: string | null | undefined) => {
    if (!place) return { state: '', district: '' };
    const parts = place.split(', ');
    if (parts.length === 2) {
      return { district: parts[0], state: parts[1] };
    }
    return { state: '', district: '' };
  };

  const initialPlace = parsePlace(initialData?.place);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    country: initialPlace.state ? 'India' : '',
    state: initialPlace.state,
    district: initialPlace.district,
    dateOfBirth: initialData?.dateOfBirth 
      ? (typeof initialData.dateOfBirth === 'string' 
          ? initialData.dateOfBirth.split('T')[0] 
          : new Date(initialData.dateOfBirth).toISOString().split('T')[0])
      : '',
    photo: initialData?.photo || '',
    roles: initialRoles,
  });

  const [availableDistricts, setAvailableDistricts] = useState<string[]>(
    formData.state ? INDIAN_STATES_DISTRICTS[formData.state] || [] : []
  );

  // Update districts when state changes
  useEffect(() => {
    if (formData.state) {
      const districts = INDIAN_STATES_DISTRICTS[formData.state] || [];
      setAvailableDistricts(districts);
      // Reset district if it's not in the new state's districts
      if (formData.district && !districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.state]);

  const handleRoleChange = (role: RoleType | 'NONE') => {
    setFormData(prev => {
      // Remove all additional roles (keep only PLAYER)
      const baseRoles = [RoleType.PLAYER];
      
      // Add the selected role if it's not NONE
      if (role !== 'NONE') {
        return { ...prev, roles: [...baseRoles, role] };
      }
      
      return { ...prev, roles: baseRoles };
    });
    
    // Clear role error when user makes changes
    if (errors.roles) {
      setErrors({ ...errors, roles: undefined });
    }
  };

  // Get the current additional role (if any)
  const getAdditionalRole = (): RoleType | 'NONE' => {
    const additionalRoles = formData.roles.filter(r => r !== RoleType.PLAYER);
    return additionalRoles.length > 0 ? additionalRoles[0] : 'NONE';
  };

  const validateForm = (): boolean => {
    try {
      managerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path as keyof FormErrors] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const url = mode === 'create' 
        ? `/api/clubs/${clubId}/players` 
        : `/api/players/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Combine state and district into place field
      const place = formData.state && formData.district 
        ? `${formData.district}, ${formData.state}`
        : null;

      // Ensure PLAYER role is always included
      const roles = formData.roles.includes(RoleType.PLAYER) 
        ? formData.roles 
        : [RoleType.PLAYER, ...formData.roles];

      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        place: place,
        photo: formData.photo || null,
        roles: roles,
      };

      if (formData.dateOfBirth) {
        payload.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      } else {
        payload.dateOfBirth = null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ submit: data.error || 'An error occurred' });
        }
        showToast(data.error || 'Failed to save member', 'error');
        return;
      }

      // Success
      showToast(
        mode === 'create' ? 'Member added successfully' : 'Member updated successfully',
        'success'
      );
      
      // Redirect to appropriate list
      const redirectPath = returnPath || `/dashboard/clubs/${clubId}/managers`;
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const cancelPath = returnPath || `/dashboard/clubs/${clubId}/managers`;
    router.push(cancelPath);
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user makes changes
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter member name"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleFieldChange('email', e.target.value)}
        error={errors.email}
        placeholder="member@example.com (optional)"
      />

      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => handleFieldChange('phone', e.target.value)}
        error={errors.phone}
        placeholder="+91 1234567890"
        helperText="Optional"
      />

      <Select
        label="Country"
        value={formData.country}
        onChange={(e) => {
          const newCountry = e.target.value;
          setFormData({
            ...formData,
            country: newCountry,
            state: newCountry === 'India' ? formData.state : '',
            district: newCountry === 'India' ? formData.district : '',
          });
        }}
        options={[
          { value: '', label: 'Select Country' },
          ...COUNTRIES.map(country => ({ value: country, label: country }))
        ]}
      />

      {formData.country === 'India' && (
        <>
          <Select
            label="State"
            value={formData.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            error={errors.state}
            options={[
              { value: '', label: 'Select State' },
              ...INDIAN_STATES.map(state => ({ value: state, label: state }))
            ]}
          />

          <Select
            label="District"
            value={formData.district}
            onChange={(e) => handleFieldChange('district', e.target.value)}
            error={errors.district}
            disabled={!formData.state}
            options={[
              { value: '', label: formData.state ? 'Select District' : 'Select State First' },
              ...availableDistricts.map(district => ({ value: district, label: district }))
            ]}
            helperText={formData.state ? 'Optional' : 'Please select a state first'}
          />
        </>
      )}

      <Input
        label="Date of Birth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
        error={errors.dateOfBirth}
        helperText="Optional"
      />

      <ImageUpload
        label="Member Photo"
        value={formData.photo}
        onChange={(url) => handleFieldChange('photo', url)}
        error={errors.photo}
        helperText="Upload a photo (max 5MB, JPG/PNG)"
        folder="/member-photos"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Role
        </label>
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-900">Every member is a Player by default</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              name="additionalRole"
              checked={getAdditionalRole() === 'NONE'}
              onChange={() => handleRoleChange('NONE')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Player Only (no additional role)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              name="additionalRole"
              checked={getAdditionalRole() === RoleType.MANAGER}
              onChange={() => handleRoleChange(RoleType.MANAGER)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Manager</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              name="additionalRole"
              checked={getAdditionalRole() === RoleType.MENTOR}
              onChange={() => handleRoleChange(RoleType.MENTOR)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mentor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              name="additionalRole"
              checked={getAdditionalRole() === RoleType.CAPTAIN}
              onChange={() => handleRoleChange(RoleType.CAPTAIN)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Captain</span>
          </label>
        </div>
        {errors.roles && (
          <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Select one additional role (Manager, Mentor, or Captain are mutually exclusive)
        </p>
      </div>

      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {mode === 'create' ? 'Add Member' : 'Update Member'}
        </Button>
      </div>
    </form>
  );
}
