'use client';

import { useState, useRef } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  helperText?: string;
  folder?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  error,
  helperText,
  folder = '/club-logos',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const uploadRef = useRef<any>(null);

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
  const authenticator = async () => {
    try {
      const response = await fetch('/api/imagekit-auth');
      if (!response.ok) {
        throw new Error('Failed to authenticate');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  const onError = (err: any) => {
    console.error('Upload error:', err);
    setUploadError('Failed to upload image. Please try again.');
    setIsUploading(false);
  };

  const onSuccess = (res: any) => {
    console.log('Upload success:', res);
    onChange(res.url);
    setIsUploading(false);
    setUploadError('');
  };

  const onUploadStart = () => {
    setIsUploading(true);
    setUploadError('');
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {value && (
          <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <IKContext
          publicKey={publicKey}
          urlEndpoint={urlEndpoint}
          authenticator={authenticator}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : value ? 'Change Logo' : 'Upload Logo'}
            </button>
            
            <IKUpload
              fileName="club-logo.jpg"
              folder={folder}
              onError={onError}
              onSuccess={onSuccess}
              onUploadStart={onUploadStart}
              style={{ display: 'none' }}
              ref={uploadRef}
              validateFile={(file: File) => {
                if (file.size > 5 * 1024 * 1024) {
                  setUploadError('File size must be less than 5MB');
                  return false;
                }
                if (!file.type.startsWith('image/')) {
                  setUploadError('Only image files are allowed');
                  return false;
                }
                return true;
              }}
            />
          </div>
        </IKContext>

        {(error || uploadError) && (
          <p className="text-sm text-red-600">{error || uploadError}</p>
        )}
        
        {!error && !uploadError && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    </div>
  );
}
