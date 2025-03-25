"use client";

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '../common/CloudinaryUpload';
import { toast } from 'react-hot-toast';

interface EditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (bannerData: {
    id: string;
    title: string;
    status: 'active' | 'inactive';
    imageUrl?: string;
  }) => void;
  banner: {
    id: string;
    title: string;
    status: 'active' | 'inactive';
    imageUrl: string;
  };
}

const EditBannerModal: React.FC<EditBannerModalProps> = ({ isOpen, onClose, onUpdate, banner }) => {
  const [title, setTitle] = React.useState(banner.title);
  const [status, setStatus] = React.useState(banner.status);
  const [imageUrl, setImageUrl] = React.useState(banner.imageUrl);
  const [previewUrl, setPreviewUrl] = React.useState(banner.imageUrl);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string>('');

  React.useEffect(() => {
    setTitle(banner.title);
    setStatus(banner.status);
    setImageUrl(banner.imageUrl);
    setPreviewUrl(banner.imageUrl);
  }, [banner]);

  const handleImageUploadSuccess = (url: string) => {
    setImageUrl(url);
    setPreviewUrl(url);
    setUploadError('');
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    toast.error('Failed to upload image. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate({
        id: banner.id,
        title: title.trim(),
        status,
        imageUrl
      });
      toast.success('Banner updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-700 font-semibold">Edit Banner</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 text-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full text-gray-700 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <CloudinaryUpload
                onUploadSuccess={handleImageUploadSuccess}
                onUploadError={handleImageUploadError}
              />
              {previewUrl && (
                <div className="mt-2 text-gray-700 relative h-40 w-full">
                  <Image
                    src={previewUrl}
                    alt="Banner preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              {uploadError && (
                <p className="text-red-500 text-xs mt-1">{uploadError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-primary text-white bg-blue-500 rounded-md  disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBannerModal;
