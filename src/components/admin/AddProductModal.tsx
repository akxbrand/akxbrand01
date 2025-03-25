"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
}

interface ProductSize {
  size: string;
  description?: string;
  uniqueFeatures?: string;
  productDetails?: string;
  careInstructions?: string;
  deliveryReturns?: string;
  oldPrice?: number;
  price: number;
  stock: number;
  isLimitedTimeDeal: boolean;
  dealStartTime?: string;
  dealEndTime?: string;
  dealQuantityLimit?: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (productData: {
    name: string;
    nickname: string;
    images: string[];
    categoryId: string;
    uniqueFeatures?: string;
  productDetails?: string;
  careInstructions?: string;
  deliveryReturns?: string;
    subCategoryId?: string;
    description: string;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isTop10?: boolean;
    sizes: ProductSize[];
  }) => void;
}

export default function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [uniqueFeatures, setUniqueFeatures] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [deliveryReturns, setDeliveryReturns] = useState('');
  const [imageError, setImageError] = useState<string>('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTop10, setIsTop10] = useState(false);
  const [isLimitted, setIsLimitted] = useState(false);
  const [currentColor, setCurrentColor] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [currentSize, setCurrentSize] = useState<ProductSize>({
    size: '',
    description: '',
    uniqueFeatures: "",
  productDetails: "",
  careInstructions: "",
  deliveryReturns: " ",
    oldPrice: 0,
    price: 0,
    stock: 0,
    isLimitedTimeDeal: false,
    dealStartTime: '',
    dealEndTime: '',
    dealQuantityLimit: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };
  const handleImageUploadSuccess = (url: string) => {
    if (imageUrls.length < 5) { // Maximum 5 images
      setImageUrls([...imageUrls, url]);
      setImageError(imageUrls.length + 1 < 3 ? 'Please add at least 3 product images' : '');
    }
  };

  const handleImageUploadError = (error: string) => {
    setImageError(error);
  };

  // const handleAddImageUrl = () => {
  //   if (currentImageUrl && currentImageUrl.trim() !== '') {
  //     if (imageUrls.length < 5) { // Maximum 5 images
  //       setImageUrls([...imageUrls, currentImageUrl.trim()]);
  //       setCurrentImageUrl('');
  //       setImageError(imageUrls.length + 1 < 3 ? 'Please add at least 3 product images' : '');
  //     }
  //   }
  // };

  const removeImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setImageError(newImages.length < 3 ? 'Please add at least 3 product images' : '');
  };

  const handleAddSize = () => {
    if (currentSize.size && currentSize.price > 0) {
      setSizes([...sizes, currentSize]);
      setCurrentSize({
        size: '',
        description: '',
        uniqueFeatures: "",
  productDetails: "",
  careInstructions: "",
  deliveryReturns: " ",
        oldPrice: 0,
        price: 0,
        stock: 0,
        isLimitedTimeDeal: false,
        dealStartTime: '',
        dealEndTime: '',
        dealQuantityLimit: 0
      });
    }
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    if (imageUrls.length < 3) {
      setImageError('Please add at least 3 product images');
      return;
    }

    if (sizes.length === 0) {
      setError('Please add at least one size');
      return;
    }

    // Calculate the minimum price from all sizes
    const price = Math.min(...sizes.map(size => size.price));

    onAdd({
      name,
      nickname,
      images: imageUrls,
      categoryId,
      subCategoryId: subCategoryId || undefined,
      description,
      uniqueFeatures,
      productDetails,
      careInstructions,
      deliveryReturns,
      isBestSeller,
      isNewArrival,
      isTop10,
      isLimitted,
      price,
      sizes: sizes.map(size => ({
        ...size,
        dealStartTime: size.dealStartTime ? new Date(size.dealStartTime).toISOString() : undefined,
        dealEndTime: size.dealEndTime ? new Date(size.dealEndTime).toISOString() : undefined,
      })),
    });

    // Reset form
    setName('');
    setNickname('');
    setImageUrls([]);
    setCategoryId('');
    setSubCategoryId('');
    setDescription('');
    setUniqueFeatures('');
    setProductDetails('');
    setCareInstructions('');
    setDeliveryReturns('');
    setIsBestSeller(false);
    setIsNewArrival(false);
    setIsTop10(false);
    setIsLimitted(false);
    // setColors([]);
    setCurrentColor('');
    setSizes([]);
    setCurrentSize({
      size: '',
      description: '',
      uniqueFeatures: "",
  productDetails: "",
  careInstructions: "",
  deliveryReturns: " ",
      oldPrice: 0,
      price: 0,
      stock: 0,
      isLimitedTimeDeal: false,
      dealStartTime: '',
      dealEndTime: '',
      dealQuantityLimit: 0
    });
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3> */}

              {/* Product Images */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
                <div className="grid grid-cols-5 gap-4 mb-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image src={url} alt={`Product ${index + 1}`} width={100} height={100} className="rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {imageUrls.length < 5 && (
                    <CloudinaryUpload onUploadSuccess={handleImageUploadSuccess} onUploadError={handleImageUploadError} />
                  )}
                </div>
                {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
              </div> */}

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nick Name (Optional)</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Product Status */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Best Seller</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">New Arrival</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isTop10}
                    onChange={(e) => setIsTop10(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isLimitted}
                    onChange={(e) => setIsLimitted(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Limitted deal</span>
                </label>
              </div>

              {/* Size Management */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Size Management</h4>

                {/* Size List */}
                <div className="space-y-4 mb-4 text-gray-700">
                  {sizes.map((size, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{size.size}</h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <p>Price: ₹{size.price}</p>
                        <p>Stock: {size.stock}</p>
                        {size.oldPrice && <p>Old Price: ₹{size.oldPrice}</p>}
                        {size.isLimitedTimeDeal && (
                          <div className="col-span-2">
                            <p>Limited Time Deal: {size.dealStartTime} - {size.dealEndTime}</p>
                            <p>Quantity Limit: {size.dealQuantityLimit}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Size Form */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                      <input
                        type="text"
                        value={currentSize.size}
                        onChange={(e) => setCurrentSize({ ...currentSize, size: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        value={currentSize.price}
                        onChange={(e) => setCurrentSize({ ...currentSize, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Old Price</label>
                      <input
                        type="number"
                        value={currentSize.oldPrice}
                        onChange={(e) => setCurrentSize({ ...currentSize, oldPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                      <input
                        type="number"
                        value={currentSize.stock}
                        onChange={(e) => setCurrentSize({ ...currentSize, stock: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                  </div>
                  <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      // type="text"
                      rows={3}
                      value={currentSize.description}
                      onChange={(e) => setCurrentSize({ ...currentSize, description: e.target.value })}
                      className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unique Features</label>
                    <textarea
                      // type="text"
                      rows={3}
                      value={currentSize.uniqueFeatures}
                      onChange={(e) => setCurrentSize({ ...currentSize, uniqueFeatures: e.target.value })}
                      className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Details</label>
                    <textarea
                      // type="text"
                      rows={3}
                      value={currentSize.productDetails}
                      onChange={(e) => setCurrentSize({ ...currentSize, productDetails: e.target.value })} 
                      className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                    <textarea
                      // type="text"
                      rows={3}
                      value={currentSize.careInstructions}
                      onChange={(e) => setCurrentSize({ ...currentSize, careInstructions: e.target.value })} 
                      className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery & Returns</label>
                    <textarea
                      // type="text"
                      rows={3}
                      value={currentSize.deliveryReturns}
                      onChange={(e) => setCurrentSize({ ...currentSize, deliveryReturns: e.target.value })} 
                      className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                 
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentSize.isLimitedTimeDeal}
                        onChange={(e) => setCurrentSize({ ...currentSize, isLimitedTimeDeal: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Limited Time Deal</span>
                    </label>
                  </div>

                  {currentSize.isLimitedTimeDeal && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Start Time</label>
                        <input
                          type="datetime-local"
                          value={currentSize.dealStartTime}
                          onChange={(e) => setCurrentSize({ ...currentSize, dealStartTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal End Time</label>
                        <input
                          type="datetime-local"
                          value={currentSize.dealEndTime}
                          onChange={(e) => setCurrentSize({ ...currentSize, dealEndTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Quantity Limit</label>
                        <input
                          type="number"
                          value={currentSize.dealQuantityLimit}
                          onChange={(e) => setCurrentSize({ ...currentSize, dealQuantityLimit: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add Size
                  </button>
                </div>
              </div>

              {/* Nickname */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 text-gray-800 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubCategoryId('');
                  }}
                  className="w-full px-3 text-gray-800 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Selection */}
              {selectedCategory && selectedCategory.subCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory
                  </label>
                  <select
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subcategory</option>
                    {selectedCategory.subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images * (Min 3, Max 5)
                </label>
                <div className="space-y-2">
                  <CloudinaryUpload
                    onUploadSuccess={handleImageUploadSuccess}
                    onUploadError={handleImageUploadError}
                  />
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative w-full h-24 border rounded-lg overflow-hidden">
                            <Image
                              src={url}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imageError && (
                    <p className="text-red-500 text-xs mt-1">{imageError}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {imageUrls.length}/5 images uploaded
                  </p>
                </div>
              </div>
              {/* Description */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


