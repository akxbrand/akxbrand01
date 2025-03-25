"use client";

import React, { useState,useEffect } from 'react';
import Toast from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import AddCategoryModal from '@/components/admin/AddCategoryModal';
import EditCategoryModal from '@/components/admin/EditCategoryModal';
import AddSubCategoryModal from '@/components/admin/AddSubCategoryModal';
import EditSubCategoryModal from '@/components/admin/EditSubCategoryModal';
import { Plus, PenSquare, Trash2, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import Image from 'next/image';

interface SubCategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  status: 'Active' | 'Inactive';
  image?: string;
}

export default function CategoriesPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    image: string;
    description: string;
    status: 'Active' | 'Inactive';
    products: number;
  } | null>(null);

  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    image: string;
    products: number;
  }>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          status: cat.status === 'Active' ? 'Active' : 'Inactive',
          image: cat.imageUrl,
          products: cat.count || 0
        })));
        setSubCategories(data.categories.flatMap((cat: any) => 
          cat.subCategories.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            description: sub.description || '',
            categoryId: cat.id,
            status: sub.status === 'Active' ? 'Active' : 'Inactive',
            image: sub.imageUrl
          }))
        ));
      } else {
        throw new Error(data.error || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setToastMessage(error.message || 'Error fetching categories');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddCategory = async (categoryData: {
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    imageUrl: string;
    subcategories: Array<{
      name: string;
      description: string;
      imageUrl: string;
    }>;
  }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.imageUrl,
          status: categoryData.status,
          subcategories: categoryData.subcategories
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        setIsAddModalOpen(false);
        setToastMessage('Category added successfully');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      setToastMessage(error.message || 'Error adding category');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditCategory = async (categoryData: {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    image: string;
    products: number;
  }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.image,
          status: categoryData.status
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        setIsEditModalOpen(false);
        setSelectedCategory(null);
        setToastMessage('Category updated successfully');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setToastMessage('Error updating category');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddSubCategory = async (subCategoryData: {
    name: string;
    description: string;
    categoryId: string;
    status: 'Active' | 'Inactive';
    imageUrl: string;
  }) => {
    try {
      const response = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategoryData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        setIsAddSubModalOpen(false);
        setToastMessage('Subcategory added successfully');
        setToastType('success');
        setShowToast(true);
        if (!expandedCategories.includes(subCategoryData.categoryId)) {
          setExpandedCategories(prev => [...prev, subCategoryData.categoryId]);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setToastMessage('Error adding subcategory');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditSubCategory = async (subCategoryData: SubCategory) => {
    try {
      const response = await fetch('/api/subcategories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategoryData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchCategories();
        setIsEditSubModalOpen(false);
        setSelectedSubCategory(null);
        setToastMessage('Subcategory updated successfully');
        setToastType('success');
        setShowToast(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setToastMessage('Error updating subcategory');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this subcategory?')) {
        const response = await fetch('/api/subcategories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: subCategoryId })
        });

        const data = await response.json();
        if (data.success) {
          await fetchCategories();
          setToastMessage('Subcategory deleted successfully');
          setToastType('success');
          setShowToast(true);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      setToastMessage('Error deleting subcategory');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this category?')) {
        const response = await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: categoryId })
        });

        const data = await response.json();
        if (data.success) {
          await fetchCategories();
          setToastMessage('Category deleted successfully');
          setToastType('success');
          setShowToast(true);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      setToastMessage('Error deleting category');
      setToastType('error');
      setShowToast(true);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <AdminLayout title="Categories Page">
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />

      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleEditCategory}
          category={selectedCategory}
        />
      )}

      <AddSubCategoryModal
        isOpen={isAddSubModalOpen}
        onClose={() => setIsAddSubModalOpen(false)}
        onAdd={handleAddSubCategory}
        categories={categories}
      />

      {selectedSubCategory && (
        <EditSubCategoryModal
          isOpen={isEditSubModalOpen}
          onClose={() => {
            setIsEditSubModalOpen(false);
            setSelectedSubCategory(null);
          }}
          onSave={handleEditSubCategory}
          subCategory={selectedSubCategory}
          categories={categories}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-700">Manage Categories</h2>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 relative flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{category.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.products}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-green-50 text-green-600">
                      {category.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddSubModalOpen(true);
                          setSelectedCategory(category);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-blue-600"
                        title="Add Subcategory"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <PenSquare className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCategories.includes(category.id) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-0">
                      <div className="border-l-2 border-gray-200 ml-4 pl-4 space-y-2 py-2">
                        {subCategories
                          .filter(sub => sub.categoryId === category.id)
                          .map(subCategory => (
                            <div
                              key={subCategory.id}
                              className="flex items-center justify-between py-2 pl-8 pr-4 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 relative flex-shrink-0">
                                  {subCategory.image ? (
                                    <Image
                                      src={subCategory.image}
                                      alt={subCategory.name}
                                      fill
                                      className="object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                      <FolderOpen className="w-4 h-4 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {subCategory.name}
                                  </span>
                                  <p className="text-sm text-gray-500">{subCategory.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${subCategory.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                                  {subCategory.status}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedSubCategory(subCategory);
                                      setIsEditSubModalOpen(true);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <PenSquare className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubCategory(subCategory.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Trash2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </AdminLayout>
  );
}
