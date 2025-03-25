"use client";

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { X } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';

interface Category {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  image: string;
  products: number;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Category) => void;
  category: Category;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
}: EditCategoryModalProps) {
  const [formData, setFormData] = useState<Category>(category);
  const [imagePreview, setImagePreview] = useState<string>(category.image);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setFormData(category);
    setImagePreview(category.image);
  }, [category]);

  const handleImageUploadSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
    setUploadError('');
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      setUploadError('Please upload a category image');
      return;
    }
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Category</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image <span className="text-red-500">*</span>
            </label>
            <CloudinaryUpload
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={handleImageUploadError}
            />
            {imagePreview && (
              <div className="mt-2 relative w-full h-32 border rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: '' }));
                    setImagePreview('');
                  }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-red-500 text-xs mt-1">{uploadError}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 resize-none text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
              className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
