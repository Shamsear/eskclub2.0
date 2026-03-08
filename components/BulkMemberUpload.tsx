'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useToast } from './ui/Toast';
import { INDIAN_STATES, INDIAN_STATES_DISTRICTS } from '@/lib/data/indian-states-districts';
import { COUNTRIES } from '@/lib/data/countries';

interface BulkMemberUploadProps {
  clubId: number;
}

interface ParsedMember {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  state?: string;
  district?: string;
  dateOfBirth?: string;
  role?: string;
}

interface FormMember extends ParsedMember {
  id: number;
}

type UploadMode = 'form' | 'excel';

export function BulkMemberUpload({ clubId }: BulkMemberUploadProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<UploadMode>('form');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ParsedMember[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Form mode state
  const [formMembers, setFormMembers] = useState<FormMember[]>([
    { id: 1, name: '', email: '', phone: '', country: '', state: '', district: '', dateOfBirth: '', role: 'PLAYER' }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setErrors(['CSV file must contain at least a header row and one data row']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setErrors([`Missing required column: ${missingHeaders.join(', ')}`]);
      return;
    }

    const members: ParsedMember[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const member: ParsedMember = {
        name: '',
        email: '',
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'name':
            member.name = value;
            break;
          case 'email':
            member.email = value;
            break;
          case 'phone':
            member.phone = value;
            break;
          case 'country':
            member.country = value;
            break;
          case 'state':
            member.state = value;
            break;
          case 'district':
            member.district = value;
            break;
          case 'dateofbirth':
          case 'date_of_birth':
            member.dateOfBirth = value;
            break;
          case 'role':
            member.role = value.toUpperCase();
            break;
        }
      });

      if (!member.name) {
        parseErrors.push(`Row ${i + 1}: Name is required`);
      } else if (member.email && !member.email.includes('@')) {
        parseErrors.push(`Row ${i + 1}: Invalid email format`);
      } else {
        members.push(member);
      }
    }

    setPreview(members);
    setErrors(parseErrors);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      showToast('No valid members to upload', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(`/api/clubs/${clubId}/players/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: preview }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to upload members', 'error');
        return;
      }

      // Check if any members were actually added
      if (data.added === 0) {
        if (data.skipped > 0) {
          showToast(
            `No new members added. ${data.skipped} member(s) already exist with the same email.`,
            'error'
          );
        } else if (data.errors && data.errors.length > 0) {
          showToast(
            `Failed to add members. Errors: ${data.errors.join(', ')}`,
            'error'
          );
        } else {
          showToast('No members were added. Please check your CSV file and try again.', 'error');
        }
        return; // Don't redirect, stay on the page
      }

      // Show success message with details
      let message = `Successfully added ${data.added} member(s)`;
      if (data.skipped > 0) {
        message += `. ${data.skipped} skipped (duplicates)`;
      }
      if (data.errors && data.errors.length > 0) {
        message += `. Some errors occurred: ${data.errors.join(', ')}`;
      }
      
      showToast(message, data.errors && data.errors.length > 0 ? 'warning' : 'success');
      
      router.push(`/dashboard/clubs/${clubId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const addFormMember = () => {
    setFormMembers(prev => {
      const newId = Math.max(...prev.map(m => m.id)) + 1;
      return [...prev, {
        id: newId,
        name: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        district: '',
        dateOfBirth: '',
        role: 'PLAYER'
      }];
    });
  };

  const removeFormMember = (id: number) => {
    setFormMembers(prev => {
      if (prev.length === 1) {
        showToast('At least one member is required', 'error');
        return prev;
      }
      return prev.filter(m => m.id !== id);
    });
  };

  const updateFormMember = (id: number, field: keyof FormMember, value: string) => {
    setFormMembers(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleFormSubmit = async () => {
    // Validate form members
    const validMembers = formMembers.filter(m => m.name);
    
    if (validMembers.length === 0) {
      showToast('Please fill in at least one member with a name', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(`/api/clubs/${clubId}/players/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: validMembers }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to add members', 'error');
        return;
      }

      // Check if any members were actually added
      if (data.added === 0) {
        if (data.skipped > 0) {
          showToast(
            `No new members added. ${data.skipped} member(s) already exist with the same email.`,
            'error'
          );
        } else if (data.errors && data.errors.length > 0) {
          showToast(
            `Failed to add members. Errors: ${data.errors.join(', ')}`,
            'error'
          );
        } else {
          showToast('No members were added. Please check your data and try again.', 'error');
        }
        return; // Don't redirect, stay on the page
      }

      // Show success message with details
      let message = `Successfully added ${data.added} member(s)`;
      if (data.skipped > 0) {
        message += `. ${data.skipped} skipped (duplicates)`;
      }
      if (data.errors && data.errors.length > 0) {
        message += `. Some errors occurred: ${data.errors.join(', ')}`;
      }
      
      showToast(message, data.errors && data.errors.length > 0 ? 'warning' : 'success');
      
      router.push(`/dashboard/clubs/${clubId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV with instructions
    const template = `name,email,phone,country,state,district,dateOfBirth,role
John Doe,john@example.com,+91 1234567890,India,Karnataka,Bengaluru Urban,1990-01-15,PLAYER
Jane Smith,jane@example.com,+91 9876543210,India,Maharashtra,Mumbai City,1992-05-20,MANAGER
Mike Johnson,mike@example.com,+1 5551234567,United States,,,1988-03-10,PLAYER

Instructions:
- name is required (all other fields are optional)
- email format: valid email address
- phone format: country code + number
- country: Select from available countries
- state: Only for India - Select from Indian states
- district: Only for India - Select district based on state
- dateOfBirth format: YYYY-MM-DD
- role: PLAYER, MANAGER, MENTOR, or CAPTAIN (defaults to PLAYER)

Available Countries: ${COUNTRIES.join(', ')}
Available Indian States: ${INDIAN_STATES.join(', ')}`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Choose Upload Method</h2>
              <p className="text-sm text-gray-600 mt-0.5">Select how you want to add members</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('form')}
              className={`group p-6 border-2 rounded-xl transition-all ${
                mode === 'form'
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                  mode === 'form' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg' 
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <svg className={`w-8 h-8 ${mode === 'form' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Form Entry</h3>
              <p className="text-sm text-gray-600">
                Add members one by one using an easy-to-use form with dropdowns for state and district
              </p>
              {mode === 'form' && (
                <div className="mt-3 flex items-center justify-center gap-1 text-blue-600 font-medium text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              )}
            </button>

            <button
              onClick={() => setMode('excel')}
              className={`group p-6 border-2 rounded-xl transition-all ${
                mode === 'excel'
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                  : 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                  mode === 'excel' 
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg' 
                    : 'bg-emerald-100 group-hover:bg-emerald-200'
                }`}>
                  <svg className={`w-8 h-8 ${mode === 'excel' ? 'text-white' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">CSV Upload</h3>
              <p className="text-sm text-gray-600">
                Upload multiple members at once using a CSV file with predefined format
              </p>
              {mode === 'excel' && (
                <div className="mt-3 flex items-center justify-center gap-1 text-emerald-600 font-medium text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Selected
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Mode */}
      {mode === 'form' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Add Members</h2>
                    <p className="text-sm text-gray-600 mt-0.5">{formMembers.length} member{formMembers.length !== 1 ? 's' : ''} in form</p>
                  </div>
                </div>
                <button
                  onClick={addFormMember}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {formMembers.map((member, index) => (
                <div key={member.id} className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Member {index + 1}</h3>
                    </div>
                    {formMembers.length > 1 && (
                      <button
                        onClick={() => removeFormMember(member.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Input
                        label="Name"
                        value={member.name}
                        onChange={(e) => updateFormMember(member.id, 'name', e.target.value)}
                        placeholder="Enter name"
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={member.email}
                        onChange={(e) => updateFormMember(member.id, 'email', e.target.value)}
                        placeholder="email@example.com (optional)"
                      />
                      <Input
                        label="Phone"
                        value={member.phone || ''}
                        onChange={(e) => updateFormMember(member.id, 'phone', e.target.value)}
                        placeholder="+91 1234567890"
                      />
                      <Select
                        label="Country"
                        value={member.country || ''}
                        onChange={(e) => {
                          const newCountry = e.target.value;
                          updateFormMember(member.id, 'country', newCountry);
                          if (newCountry !== 'India') {
                            updateFormMember(member.id, 'state', '');
                            updateFormMember(member.id, 'district', '');
                          }
                        }}
                        options={[
                          { value: '', label: 'Select Country' },
                          ...COUNTRIES.map(country => ({ value: country, label: country }))
                        ]}
                      />
                      {member.country === 'India' && (
                        <>
                          <Select
                            label="State"
                            value={member.state || ''}
                            onChange={(e) => {
                              updateFormMember(member.id, 'state', e.target.value);
                              updateFormMember(member.id, 'district', ''); // Reset district
                            }}
                            options={[
                              { value: '', label: 'Select State' },
                              ...INDIAN_STATES.map(state => ({ value: state, label: state }))
                            ]}
                          />
                          <Select
                            label="District"
                            value={member.district || ''}
                            onChange={(e) => updateFormMember(member.id, 'district', e.target.value)}
                            disabled={!member.state}
                            options={[
                              { value: '', label: member.state ? 'Select District' : 'Select State First' },
                              ...(member.state ? INDIAN_STATES_DISTRICTS[member.state]?.map(district => ({
                                value: district,
                                label: district
                              })) || [] : [])
                            ]}
                          />
                        </>
                      )}
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={member.dateOfBirth || ''}
                        onChange={(e) => updateFormMember(member.id, 'dateOfBirth', e.target.value)}
                      />
                      <Select
                        label="Role"
                        value={member.role || 'PLAYER'}
                        onChange={(e) => updateFormMember(member.id, 'role', e.target.value)}
                        options={[
                          { value: 'PLAYER', label: 'Player Only' },
                          { value: 'MANAGER', label: 'Manager' },
                          { value: 'MENTOR', label: 'Mentor' },
                          { value: 'CAPTAIN', label: 'Captain' },
                        ]}
                      />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end px-6 pb-6">
                <button
                  onClick={handleFormSubmit}
                  disabled={isUploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add {formMembers.filter(m => m.name).length} Member{formMembers.filter(m => m.name).length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
            </div>
          </div>
        </>
      )}

      {/* Excel Mode */}
      {mode === 'excel' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Instructions</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Follow these steps to upload members via CSV</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ol className="space-y-3">
                {[
                  'Download the CSV template',
                  'Fill in member details (only name is required)',
                  'Optional fields: email, phone, country, state, district, dateOfBirth, role',
                  'State and district are only for India - leave empty for other countries',
                  'Role can be: PLAYER, MANAGER, MENTOR, or CAPTAIN (defaults to PLAYER)',
                  'Upload the CSV file and review the preview',
                  'Click "Upload Members" to add them to the club'
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-xs">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6">
                <button
                  onClick={downloadTemplate}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Upload CSV File</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Select your CSV file to upload</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all bg-gradient-to-br from-gray-50 to-white">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mb-1">Click to upload CSV file</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  {file && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{file.name}</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-red-300 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-5 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Validation Errors</h3>
                    <p className="text-sm text-red-700 mt-0.5">{errors.length} error{errors.length !== 1 ? 's' : ''} found in CSV file</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-red-50">
                <ul className="space-y-2">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Preview</h2>
                      <p className="text-sm text-gray-600 mt-0.5">{preview.length} member{preview.length !== 1 ? 's' : ''} ready to upload</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || errors.length > 0}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Members
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {member.district && member.state ? `${member.district}, ${member.state}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                            {member.role || 'PLAYER'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
