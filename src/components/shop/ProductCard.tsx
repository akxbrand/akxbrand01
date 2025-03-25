'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Star,X } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
    oldPrice?: number;
    rating?: number;
    description: string;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isLimitted?: boolean;
    stock: number;
    sizes: { size: string; stock: number; price: number }[];
    category: {
      name: string;
    };
    subCategory?: {
      name: string;
    };
  };
  viewMode: 'grid' | 'list';
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    handleAddToCart(size);
    setShowSizeModal(false);
  };

  const handleAddToCart = async (size: string) => {
    setIsAdding(true);
    try {
      const sizeInfo = (product.sizes || []).find(s => s.size === size);
      
      if (!sizeInfo || sizeInfo.stock <= 0) {
        setToastMessage(`Sorry, size ${size} is out of stock`);
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Check if adding one more would exceed stock for this size
      const currentCartItem = cartItems.find(item => 
        item.productId === product.id && item.size === size
      );
      const currentQuantity = currentCartItem?.quantity || 0;
      
      if (currentQuantity + 1 > sizeInfo.stock) {
        setToastMessage(`Sorry, only ${sizeInfo.stock} items available in stock for size ${size}`);
        setToastType('error');
        setShowToast(true);
        return;
      }

      await addToCart({
        id: `${product.id}-${size}`,
        productId: product.id,
        name: product.name,
        price: sizeInfo.price || product.price,
        image: product.images[0],
        size: size
      });
      setToastMessage('Product added to cart successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage('Failed to add product to cart');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsAdding(false);
    }
  };

  const calculateDiscount = () => {
    if (!product.oldPrice) return null;
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    return discount;
  };

  const renderStars = () => {
    const rating = product.rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        {rating > 0 && <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)} </span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
     
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
      <Link href={`/product/${product.id}`} className="block relative">
      {product.isLimitted && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium transform animate-pulse">
          Limited Deal
        </div>
      )}
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transform hover:scale-105 transition-transform duration-300"
          />   
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-500 mb-1 truncate">
            {product.category.name} {product.subCategory && '>'} {product.subCategory?.name}
          </div>
          <h3 className="text-sm sm:text-base text-gray-800 font-medium mb-2 line-clamp-2">{product.name}</h3>
          {renderStars()}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-base sm:text-lg text-gray-800 font-medium">₹{product.price.toLocaleString('en-IN')}</span>
            {product.oldPrice && (
              <>
                <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs sm:text-sm text-green-600">{calculateDiscount()}% off</span>
              </>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button
          onClick={() => setShowSizeModal(true)}
          className={`w-full py-2 px-4 rounded-md transition-all duration-200 ${isAdding ? 'bg-gray-500' : 'bg-gray-700 hover:bg-gray-800'} text-white flex items-center justify-center gap-2`}
          disabled={isAdding}
        >
          {isAdding ? (
            <span>Adding...</span>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>

        {showSizeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-800" onClick={() => setShowSizeModal(false)}>
            <div className="relative bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowSizeModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-semibold mb-4">Select Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {(product.sizes || []).map((sizeInfo) => {
                  const isOutOfStock = sizeInfo.stock <= 0;
                  const cartItem = cartItems.find(item => item.productId === product.id && item.size === sizeInfo.size);
                  const cartQuantity = cartItem?.quantity || 0;
                  const remainingStock = sizeInfo.stock - cartQuantity;
                  const isStockLow = remainingStock > 0 && remainingStock <= 3;
                  
                  return (
                    <button
                      key={sizeInfo.size}
                      onClick={() => !isOutOfStock && handleSizeSelect(sizeInfo.size)}
                      className={`py-2 px-4 rounded border relative ${isOutOfStock ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 hover:border-gray-700'} ${selectedSize === sizeInfo.size ? 'border-gray-700 bg-gray-100' : ''}`}
                      disabled={isOutOfStock}
                    >
                      <div className="text-sm font-medium">{sizeInfo.size}</div>
                      <div className="text-sm font-medium">₹{sizeInfo.price || product.price}</div>
                      <div className={`text-xs ${isOutOfStock ? 'text-red-500 font-medium' : isStockLow ? 'text-orange-500' : 'text-gray-500'}`}>
                        {isOutOfStock ? 'Out of stock' : 
                         isStockLow ? `Only ${remainingStock} left!` :
                         `available`}
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
