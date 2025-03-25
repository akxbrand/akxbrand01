"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import CloudinaryUpload from '@/components/common/CloudinaryUpload';
import { Product } from '@/types/product';

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

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product: Product;
}

export default function EditProductModal({ isOpen, onClose, onSave, product }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [nickname, setNickname] = useState(product.nickname);
  const [category, setCategory] = useState(product.category);
  const [oldPrice, setOldPrice] = useState(product.oldPrice || 0);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [weeklySales, setWeeklySales] = useState(product.weeklySales || 0);
  type ProductStatus = 'In Stock' | 'Limited Stock' | 'Out of Stock';
  const [status, setStatus] = useState<ProductStatus>(product.status as ProductStatus);
  const [isLimitedTimeDeal, setIsLimitedTimeDeal] = useState(product.isLimitedTimeDeal || false);
  const [dealStartTime, setDealStartTime] = useState(product.dealStartTime || '');
  const [dealEndTime, setDealEndTime] = useState(product.dealEndTime || '');
  const [dealQuantityLimit, setDealQuantityLimit] = useState(product.dealQuantityLimit || 0);
  const [isBestSeller, setIsBestSeller] = useState(product.isBestSeller || false);
  const [isNewArrival, setIsNewArrival] = useState(product.isNewArrival || false);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images);
  const [imageError, setImageError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isTop10, setIsTop10] = useState(product.isTop10 || false);
  const [isLimitted, setIsLimitted] = useState(product.isLimitted || false);
  const [sizes, setSizes] = useState<ProductSize[]>(product.sizes || []);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(-1);
  const [currentSize, setCurrentSize] = useState<ProductSize>({
    size: '',
    description: '',
    uniqueFeatures:'',
    productDetails:'',
    careInstructions:'',
    deliveryReturns:'',
    oldPrice: 0,
    price: 0,
    stock: 0,
    isLimitedTimeDeal: false,
    dealStartTime: '',
    dealEndTime: '',
    dealQuantityLimit: 0
  });

  useEffect(() => {
    setName(product.name);
    setNickname(product.nickname);
    setCategory(product.category);
    
    setOldPrice(product.oldPrice || 0);
    setPrice(product.price);
    setStock(product.stock);
    setWeeklySales(product.weeklySales || 0);
    setStatus(product.status);
    setIsLimitedTimeDeal(product.isLimitedTimeDeal || false);
    setDealStartTime(product.dealStartTime || '');
    setDealEndTime(product.dealEndTime || '');
    setDealQuantityLimit(product.dealQuantityLimit || 0);
    setIsTop10(product.isTop10 || false);
    setIsLimitted(product.isLimitted || false);
    setImagePreviews(product.images);
    setSizes(product.sizes || []);
    setSelectedSizeIndex(-1);
  }, [product]);

  useEffect(() => {
    if (selectedSizeIndex >= 0 && sizes[selectedSizeIndex]) {
      const selectedSize = sizes[selectedSizeIndex];
      setCurrentSize({
        size: selectedSize.size || '',
        description: selectedSize.description || '',
        uniqueFeatures: selectedSize.uniqueFeatures ||'',
        productDetails: selectedSize.productDetails ||'',
        careInstructions: selectedSize.careInstructions || '',
        deliveryReturns: selectedSize.deliveryReturns || '',
        oldPrice: selectedSize.oldPrice || 0,
        price: selectedSize.price || 0,
        stock: selectedSize.stock || 0,
        isLimitedTimeDeal: selectedSize.isLimitedTimeDeal || false,
        dealStartTime: selectedSize.dealStartTime || '',
        dealEndTime: selectedSize.dealEndTime || '',
        dealQuantityLimit: selectedSize.dealQuantityLimit || 0
      });
    } else {
      setCurrentSize({
        size: '',
        description: '',
        uniqueFeatures:'',
    productDetails:'',
    careInstructions:'',
    deliveryReturns:'',
        oldPrice: 0,
        price: 0,
        stock: 0,
        isLimitedTimeDeal: false,
        dealStartTime: '',
        dealEndTime: '',
        dealQuantityLimit: 0
      });
    }
  }, [selectedSizeIndex, sizes]);




  const handleImageUploadSuccess = (url: string) => {
    if (imagePreviews.length < 5) { // Maximum 5 images
      setImagePreviews([...imagePreviews, url]);
      setImageError(imagePreviews.length + 1 < 3 ? 'Please add at least 3 product images' : '');
    }
  };

  const handleImageUploadError = (error: string) => {
    setImageError(error);
  };

  const removeImage = (index: number) => {
    const newImages = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImages);
    setImageError(newImages.length < 3 ? 'Please add at least 3 product images' : '');
  };

  const handleAddSize = () => {
    if (currentSize.size && currentSize.price > 0) {
      setSizes([...sizes, currentSize]);
      setCurrentSize({
        size: '',
        description: '',
        uniqueFeatures:'',
    productDetails:'',
    careInstructions:'',
    deliveryReturns:'',
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

    if (price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (stock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    if (isLimitedTimeDeal) {
      if (!dealStartTime || !dealEndTime) {
        setError('Deal start and end times are required for limited time deals');
        return;
      }

      const start = new Date(dealStartTime);
      const end = new Date(dealEndTime);
      const now = new Date();

      if (start < now) {
        setError('Deal start time cannot be in the past');
        return;
      }

      if (end <= start) {
        setError('Deal end time must be after start time');
        return;
      }
    }

    onSave({
      name,
      nickname,
      category,
      oldPrice,
      price,
      stock,
      weeklySales,
      status,
      images: imagePreviews,
      sizes: sizes.map(size => ({
        ...size,
        dealStartTime: size.dealStartTime ? new Date(size.dealStartTime).toISOString() : undefined,
        dealEndTime: size.dealEndTime ? new Date(size.dealEndTime).toISOString() : undefined,
      })),
      isLimitedTimeDeal,
      isBestSeller,
      isNewArrival,
      isTop10,
      isLimitted
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Product</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable Area */}
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={nickname || ''}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Product Images */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-40 w-full rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {imagePreviews.length < 5 && (
                  <CloudinaryUpload
                    onUploadSuccess={handleImageUploadSuccess}
                    onUploadError={handleImageUploadError}
                  />
                )}
                {imageError && (
                  <p className="text-red-500 text-sm mt-1">{imageError}</p>
                )}
              </div>

              {/* Sizes */}
              <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm text-gray-700">
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex space-x-4 overflow-x-auto scrollbar-hide" aria-label="Sizes">
                    {sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSizeIndex(index)}
                        className={`${selectedSizeIndex === index
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                          } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                      >
                        {size.size}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSize(index);
                            if (selectedSizeIndex === index) setSelectedSizeIndex(-1);
                          }}
                          className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="bg-white border rounded-lg p-6 space-y-6">
                  {selectedSizeIndex >= 0 && (
                    <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-4 py-2 rounded-md">
                      <span className="text-sm font-medium">Editing size: {sizes[selectedSizeIndex].size}</span>
                      <button
                        onClick={() => setSelectedSizeIndex(-1)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Size *</label>
                      <input
                        type="text"
                        value={currentSize.size}
                        onChange={(e) => setCurrentSize({ ...currentSize, size: e.target.value })}
                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Enter size (e.g. S, M, L)"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Stock *</label>
                      <input
                        type="number"
                        value={currentSize.stock}
                        onChange={(e) => setCurrentSize({ ...currentSize, stock: Number(e.target.value) })}
                        className="p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Available quantity"
                        required
                        min="0"
                      />
                    </div>


                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Old Price</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={currentSize.oldPrice}
                          onChange={(e) => setCurrentSize({ ...currentSize, oldPrice: Number(e.target.value) })}
                          className="p-2 w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="0.00"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Price *</label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          value={currentSize.price}
                          onChange={(e) => setCurrentSize({ ...currentSize, price: Number(e.target.value) })}
                          className="p-2 w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="0.00"
                          required
                          min="0"
                        />
                      </div>
                    </div>


                  </div>
                  <div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        // type="text"
                        value={currentSize.description}
                        onChange={(e) => setCurrentSize({ ...currentSize, description: e.target.value })}
                        className="p-2 resize-none w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Unique Features</label>
                      <textarea
                        value={currentSize.uniqueFeatures}
                        onChange={(e) => setCurrentSize({ ...currentSize, uniqueFeatures: e.target.value })}
                        className="p-2 resize-none w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Unique Features"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Product Details</label>
                      <textarea
                        value={currentSize.productDetails}
                        onChange={(e) => setCurrentSize({ ...currentSize, productDetails: e.target.value })}
                        className="p-2 resize-none w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Product Details"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Care Instructions</label>
                      <textarea
                        value={currentSize.careInstructions}
                        onChange={(e) => setCurrentSize({ ...currentSize, careInstructions: e.target.value })}
                        className="p-2 resize-none w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Care Instructions"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Delivery & Returns</label>
                      <textarea
                        value={currentSize.deliveryReturns}
                        onChange={(e) => setCurrentSize({ ...currentSize, deliveryReturns: e.target.value })}
                        className="p-2 resize-none w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Delivery & Returns"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sizeIsLimitedTimeDeal"
                        checked={currentSize.isLimitedTimeDeal}
                        onChange={(e) => setCurrentSize({ ...currentSize, isLimitedTimeDeal: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                      />
                      <label htmlFor="sizeIsLimitedTimeDeal" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Limited Time Deal
                      </label>
                    </div>

                    {currentSize.isLimitedTimeDeal && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Deal Start Time *</label>
                          <input
                            type="datetime-local"
                            value={currentSize.dealStartTime}
                            onChange={(e) => setCurrentSize({ ...currentSize, dealStartTime: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required={currentSize.isLimitedTimeDeal}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Deal End Time *</label>
                          <input
                            type="datetime-local"
                            value={currentSize.dealEndTime}
                            onChange={(e) => setCurrentSize({ ...currentSize, dealEndTime: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required={currentSize.isLimitedTimeDeal}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Deal Quantity Limit</label>
                          <input
                            type="number"
                            value={currentSize.dealQuantityLimit}
                            onChange={(e) => setCurrentSize({ ...currentSize, dealQuantityLimit: Number(e.target.value) })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Maximum quantity for deal"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSizeIndex >= 0) {
                          const updatedSizes = [...sizes];
                          updatedSizes[selectedSizeIndex] = currentSize;
                          setSizes(updatedSizes);
                          setSelectedSizeIndex(-1);
                        } else {
                          setSizes([...sizes, currentSize]);
                        }
                        setCurrentSize({
                          size: '',
                          description: '',
                          oldPrice: 0,
                          price: 0,
                          stock: 0,
                          isLimitedTimeDeal: false,
                          dealStartTime: '',
                          dealEndTime: '',
                          dealQuantityLimit: 0
                        });
                      }}
                      disabled={!currentSize.size || currentSize.price <= 0}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {selectedSizeIndex >= 0 ? 'Update Size' : 'Add Size'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">


                {/* Weekly Sales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Sales
                  </label>
                  <input
                    type="number"
                    value={weeklySales}
                    onChange={(e) => setWeeklySales(Number(e.target.value))}
                    className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>



                {/* Best Seller & New Arrival */}
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBestSeller"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isBestSeller" className="ml-2 text-sm font-medium text-gray-700">
                      Best Seller
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isNewArrival"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isNewArrival" className="ml-2 text-sm font-medium text-gray-700">
                      New Arrival
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isTop10"
                      checked={isTop10}
                      onChange={(e) => setIsTop10(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isNewArrival" className="ml-2 text-sm font-medium text-gray-700">
                      Trending
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isLimitted"
                      checked={isLimitted}
                      onChange={(e) => setIsLimitted(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isLimitted" className="ml-2 text-sm font-medium text-gray-700">
                      Limitted Deal
                    </label>
                  </div>
                </div>


              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {/* Modal Footer - Fixed at Bottom */}
          <div className="px-1 py-3 sm:px-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
