'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import ReviewManagement from './reviewmanagement';
import { Product } from '@/types/product';
import { Review, ReviewStats } from '@/types/review';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    mediaCount: { photo: 0, video: 0 }
  });
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === 'reviews' && product.id) {
        try {
          const response = await fetch(`/api/admin/reviews?productId=${product.id}`);
          const data = await response.json();
          
          if (!response.ok) throw new Error(data.error);
          
          setReviews(data.reviews);
          setStats(data.stats);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      }
    };
  
    fetchReviews();
  }, [activeTab, product.id]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete review');
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };



  const handleAddAdminNote = async (reviewId: string, note: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (!response.ok) throw new Error('Failed to add admin note');
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, adminNotes: note } : review
        )
      );
    } catch (error) {
      console.error('Error adding admin note:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`${activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`${activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Reviews
                </button>
              </nav>
            </div>
          </div>

          {/* Modal Content - Scrollable Area */}
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-4 sm:px-6">
            {activeTab === 'details' ? (
              <div className="space-y-4 py-4">
                {/* Product Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative h-64 w-full rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Product Information */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    <p className="mt-2 text-gray-600">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="mt-1 text-gray-900">{product.category.name}</p>
                      {product.subCategory && (
                        <p className="text-sm text-gray-500">{product.subCategory.name}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Price</h4>
                      <p className="mt-1 text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                      {product.oldPrice && (
                        <p className="text-sm text-gray-500 line-through">₹{product.oldPrice.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Stock</h4>
                      <p className="mt-1 text-gray-900">{product.stock}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 text-gray-900">{product.status}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Weekly Sales</h4>
                      <p className="mt-1 text-gray-900">{product.weeklySales}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Product Type</h4>
                      <p className="mt-1 text-gray-900">
                        {[product.isBestSeller && 'Best Seller', product.isNewArrival && 'New Arrival']
                          .filter(Boolean)
                          .join(', ') || 'Standard'}
                      </p>
                    </div>
                  </div>

                  {/* Product Sizes */}
                  <div className="mt-6 text-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Sizes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.sizes?.map((size, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-700">{size.size}</h4>
                              {size.description && (
                                <p className="text-sm text-gray-500">{size.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{size.price.toLocaleString('en-IN')}</p>
                              {size.oldPrice && (
                                <p className="text-sm text-gray-500 line-through">
                                  ₹{size.oldPrice.toLocaleString('en-IN')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Stock:</span> {size.stock}
                            </div>
                            {size.isLimitedTimeDeal && (
                              <>
                                <div>
                                  <span className="text-gray-500">Deal Limit:</span> {size.dealQuantityLimit}
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500">Deal Period:</span>
                                  <br />
                                  {new Date(size.dealStartTime).toLocaleString()} -
                                  <br />
                                  {new Date(size.dealEndTime).toLocaleString()}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <ReviewManagement
                  productId={product.id}
                  reviews={reviews}
                  stats={stats}
                  onDeleteReview={handleDeleteReview}

                  onAddAdminNote={handleAddAdminNote}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

