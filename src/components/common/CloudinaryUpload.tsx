'use client';

import { useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUpload({ onUploadSuccess, onUploadError }: CloudinaryUploadProps) {
  const initializeCloudinaryWidget = useCallback(() => {
    if (typeof window === 'undefined') return;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5000000, // 5MB
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          }
        }
      },
      (error: any, result: any) => {
        if (error) {
          onUploadError?.(error.message || 'Upload failed');
          return;
        }

        if (result.event === 'success') {
          onUploadSuccess(result.info.secure_url);
        }
      }
    );

    return widget;
  }, [onUploadSuccess, onUploadError]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleUploadClick = () => {
    const widget = initializeCloudinaryWidget();
    widget?.open();
  };

  return (
    <button
      type="button"
      onClick={handleUploadClick}
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Upload className="w-4 h-4" />
      Upload Image
    </button>
  );
}