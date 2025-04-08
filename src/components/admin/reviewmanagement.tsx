import React, { useState } from 'react';
import { Review, ReviewStats } from '@/types/review';
import { Star, Flag, Trash2, MessageSquare, ImageIcon, Video } from 'lucide-react';

import Toast from '@/components/ui/Toast';
import Image from 'next/image';
import ImageModal from '@/components/ui/ImageModal';

interface ReviewManagementProps {
  productId: string;
  reviews: Review[];
  stats: ReviewStats;
  onDeleteReview: (reviewId: string) => void;
  onAddAdminNote: (reviewId: string, note: string) => void;
  onUpdateReview?: (updatedReviews: Review[]) => void;
}

export default function ReviewManagement({
  reviews: initialReviews,
  stats,
  onDeleteReview,
  onAddAdminNote,
  onUpdateReview,
}: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    rating: 'all',
    hasMedia: false,
    isHidden: false,
    isReported: false,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Update local reviews when prop changes
  React.useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const filteredReviews = (reviews || []).filter((review) => {
    if (!review) return false;
    if (filterOptions.rating !== 'all' && review.rating !== Number(filterOptions.rating)) return false;
    // if (filterOptions.hasPhoto && (!review.photo || review.photo.length === 0)) return false;
    if (filterOptions.isHidden && !review.isHidden) return false;
    if (filterOptions.isReported && (!review.reportCount || review.reportCount === 0)) return false;
    return true;
  });

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      onDeleteReview(reviewId);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow">
      {/* Stats Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Total Reviews</div>
            <div className="text-xl text-gray-600 font-semibold">{stats.totalReviews}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="text-xl text-gray-600 font-semibold flex items-center">
              {stats.averageRating.toFixed(1)}
              <Star className="w-4 h-4 text-yellow-400 ml-1" />
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Photos</div>
            <div className="text-xl text-gray-600 font-semibold flex items-center">
              {stats.mediaCount.photo}
              <ImageIcon className="w-4 h-4 text-gray-400 ml-1" />
            </div>
          </div>
         
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <select
            className="px-3 text-gray-700 py-2 border border-gray-300 rounded-md text-sm"
            value={filterOptions.rating}
            onChange={(e) => setFilterOptions({ ...filterOptions, rating: e.target.value })}
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Stars ({stats.ratingDistribution[rating] || 0})
              </option>
            ))}
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterOptions.hasMedia}
              onChange={(e) => setFilterOptions({ ...filterOptions, hasMedia: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Has Media</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterOptions.isHidden}
              onChange={(e) => setFilterOptions({ ...filterOptions, isHidden: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Hidden Reviews</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterOptions.isReported}
              onChange={(e) => setFilterOptions({ ...filterOptions, isReported: e.target.checked })}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">Reported Reviews</span>
          </label>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {filteredReviews.map((review) => (
          <div key={review.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{review.userName}</span>
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i} 
                        className={`w-4 h-4 ${review.rating ? 'fill-current' : ''} cursor-pointer`} 
                        
                      />
                    ))}
                  </div>
                  {review.isVerified && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                  {review.isHidden && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{review.text}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.photos.map((photoUrl, index) => (
                      <div key={index} className="relative">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                          <div
                            onClick={() => setSelectedImage(photoUrl)}
                            className="cursor-pointer"
                          >
                            <Image
                              src={photoUrl}
                              alt="Review photo"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {review.adminNotes && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-700">
                      <span className="font-medium">Admin Note:</span> {review.adminNotes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedReview(review);
                    setAdminNote(review.adminNotes || '');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Add Admin Note"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Delete Review"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            {review.reportCount > 0 && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                  <Flag className="w-3 h-3 mr-1" />
                  Reported {review.reportCount} times
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Admin Note Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Admin Note</h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full text-gray-700 resize-none px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Add an administrative note about this review..."
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAddAdminNote(selectedReview.id, adminNote);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
      {selectedImage && (
        <ImageModal
          isOpen={true}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
        />
      )}
    </div>
  );
}
