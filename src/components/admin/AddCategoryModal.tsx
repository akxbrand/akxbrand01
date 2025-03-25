"use client";

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (categoryData: {
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    imageUrl: string;
    subcategories: Array<{
      name: string;
      description: string;
      imageUrl: string;
    }>;
  }) => void;
}

export default function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active' as const,
    imageUrl: '',
    subcategories: [{ name: '', description: '',imageUrl: '' }]
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploadError, setUploadError] = useState('');

  const addSubcategory = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, { name: '', description: '', imageUrl: '' }]
    });
  };

  const removeSubcategory = (index: number) => {
    const newSubcategories = formData.subcategories.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      subcategories: newSubcategories
    });
  };

  const updateSubcategory = (index: number, field: 'name' | 'description' | 'imageUrl', value: string) => {
    const newSubcategories = formData.subcategories.map((subcat, i) => {
      if (i === index) {
        return { ...subcat, [field]: value };
      }
      return subcat;
    });
    setFormData({
      ...formData,
      subcategories: newSubcategories
    });
  };

  const handleImageUploadSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setUploadError('');
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setUploadError('Please upload a category image');
      return;
    }
    if (!formData.name.trim()) {
      setUploadError('Please enter a category name');
      return;
    }
    // Validate subcategories
    const validSubcategories = formData.subcategories.filter(sub => sub.name.trim() && sub.imageUrl);
    const invalidSubcategories = formData.subcategories.filter(sub => sub.name.trim() && !sub.imageUrl);
    if (invalidSubcategories.length > 0) {
      setUploadError('Please upload images for all subcategories with names');
      return;
    }
    // Only submit subcategories that have both name and image
    const dataToSubmit = {
      ...formData,
      subcategories: validSubcategories
    };
    onAdd(dataToSubmit);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      imageUrl: '',
      subcategories: [{ name: '', description: '', imageUrl: '' }]
    });
    setImagePreview('');
    setUploadError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"> */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Category</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Category Details Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Category Details</h4>
              <div className="space-y-4">
                {/* Image Upload */}
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
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
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
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter category name"
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
                    className="mt-1 block text-gray-700 resize-none w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' })}
                    className="mt-1 block text-gray-700 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subcategories Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Subcategories</h4>
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subcategory
                </button>
              </div>

              <div className="space-y-4">
                {formData.subcategories.map((subcategory, index) => (
                  <div key={index} className="relative p-4 border border-gray-200 rounded-md bg-white">
                    <div className="absolute right-2 top-2">
                      {formData.subcategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubcategory(index)}
                          className="p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Subcategory Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={subcategory.name}
                          onChange={(e) => updateSubcategory(index, 'name', e.target.value)}
                          className="mt-1 text-gray-700 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter subcategory name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={subcategory.description}
                          onChange={(e) => updateSubcategory(index, 'description', e.target.value)}
                          rows={2}
                          className="mt-1 text-gray-700 resize-none block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter subcategory description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subcategory Image <span className="text-red-500">*</span>
                        </label>
                        <CloudinaryUpload
                          onUploadSuccess={(url) => updateSubcategory(index, 'imageUrl', url)}
                          onUploadError={(error) => console.error('Error uploading subcategory image:', error)}
                        />
                        {subcategory.imageUrl && (
                          <div className="mt-2 relative w-full h-32 border rounded-lg overflow-hidden">
                            <Image
                              src={subcategory.imageUrl}
                              alt={`Subcategory ${index + 1} preview`}
                              fill
                              className="object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => updateSubcategory(index, 'imageUrl', '')}
                              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              Add Category
            </button>
          </div>
        </form>
      {/* </div> */}
    </Modal>
  );
}
