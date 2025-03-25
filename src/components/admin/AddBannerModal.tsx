import React, { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '../common/CloudinaryUpload';
import { toast } from 'react-hot-toast';

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bannerData: {
    title: string;
    description: string;
    imageUrl: string;
    image: string;
    status: 'Active' | 'Inactive';
  }) => void;
}

interface FormErrors {
  title?: string;
  imageUrl?: string;
}

export default function AddBannerModal({ isOpen, onClose, onAdd }: AddBannerModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadError, setUploadError] = useState<string>('');

  const handleImageUploadSuccess = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
    setUploadError('');
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: undefined }));
    }
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setImageUrl('');
    setImagePreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!imagePreview) {
      newErrors.imageUrl = 'Banner image is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd({
        title,
        description,
        imageUrl,
        image: imageUrl,
        status,
      });
      toast.success('Banner added successfully!');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add banner. Please try again.');
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to add banner. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('Active');
    setImagePreview('');
    setImageUrl('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">Add New Banner</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image *
              </label>
              <CloudinaryUpload
                onUploadSuccess={handleImageUploadSuccess}
                onUploadError={handleImageUploadError}
              />
              {imagePreview && (
                <div className="mt-2 relative w-full h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Banner preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              {errors.imageUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
              )}
              {uploadError && (
                <p className="text-red-500 text-xs mt-1">{uploadError}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                className={`w-full text-gray-800 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter banner title"
                required
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 resize-none text-gray-800 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter banner description"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3 sticky bottom-0 bg-white py-3 border-t">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
