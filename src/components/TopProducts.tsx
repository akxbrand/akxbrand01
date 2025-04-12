'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/ui/Toast';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  rating: number;
  isLimitted?: boolean;
  sizes: { size: string; stock: number; price: number; oldPrice?: number }[];
  category: {
    name: string;
  };
  subCategory?: {
    name: string;
  };
}

export default function TopProducts() {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch('/api/products/top');
        if (!response.ok) throw new Error('Failed to fetch top products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching top products:', error);
        setToastMessage('Failed to load top products');
        setToastType('error');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingProducts, setAddingProducts] = useState<Record<string, boolean>>({});

  const handleSizeSelect = async (product: Product, size: string) => {
    setSelectedSize(size);
    await handleAddToCart(product, size);
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const handleCartButtonClick = (product: Product) => {
    if (product.sizes && product.sizes.length === 1) {
      handleAddToCart(product, product.sizes[0].size);
    } else {
      setSelectedProduct(product);
      setShowSizeModal(true);
    }
  };

  const calculateDiscount = (sizeInfo: { price: number; oldPrice?: number }) => {
    if (!sizeInfo.oldPrice) return null;
    const discount = Math.round(((sizeInfo.oldPrice - sizeInfo.price) / sizeInfo.oldPrice) * 100);
    return discount;
  };

  const handleAddToCart = async (product: Product, size: string) => {
    setAddingProducts(prev => ({ ...prev, [product.id]: true }));
    try {
      const sizeInfo = (product.sizes || []).find(s => s.size === size);

      if (!sizeInfo || sizeInfo.stock <= 0) {
        setToastMessage(`Sorry, size ${size} is out of stock`);
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
      setAddingProducts(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-4 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Trending</h2>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[200px] h-[300px] bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending
        </h2>
        <div className="relative">

          <div ref={scrollContainerRef} className="flex overflow-x-auto scrollbar-hide px-2 scroll-smooth">
            <div className="flex space-x-4 pb-2 mx-auto">
              {products.map((product) => (
                <div key={product.id} className="flex-none w-[200px] group relative rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:scale-105">
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative h-[200px] w-full">
                      {product.isLimitted && (
                        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium transform animate-pulse">
                          Limited Deal
                        </div>
                      )}
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex text-xs text-gray-500 mb-1 items-center truncate">
                        {product.category.name}
                        {product.subCategory && (
                          <>
                            <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                            {product.subCategory.name}
                          </>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center mt-1.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="ml-1.5 text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {product.sizes && product.sizes.length > 0 ? (
                          <>
                            <span className="text-sm font-bold text-gray-900">
                              ₹{Math.min(...product.sizes.map(s => s.price)).toLocaleString('en-IN')}
                            </span>
                            {product.sizes.some(s => s.oldPrice) && (
                              <>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{Math.min(...product.sizes.filter(s => s.oldPrice).map(s => s.oldPrice!)).toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-green-600">
                                  {calculateDiscount({
                                    price: Math.min(...product.sizes.map(s => s.price)),
                                    oldPrice: Math.min(...product.sizes.filter(s => s.oldPrice).map(s => s.oldPrice!))
                                  })}% off
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-3 pt-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCartButtonClick(product);
                      }}
                      className="mt-2 w-full bg-gray-900 text-white py-1.5 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                      disabled={addingProducts[product.id]}
                    >
                      {addingProducts[product.id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSizeModal && selectedProduct && (
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
            <div className="grid grid-cols-2 gap-2">
              {(selectedProduct.sizes || []).map((sizeInfo) => {
                const isOutOfStock = sizeInfo.stock <= 0;
                return (
                  <button
                    key={sizeInfo.size}
                    onClick={() => !isOutOfStock && handleSizeSelect(selectedProduct, sizeInfo.size)}
                    className={`py-2 px-4 rounded border relative ${isOutOfStock ? 'border-gray-200 bg-gray-100 cursor-not-allowed' : 'border-gray-300 hover:border-gray-700'} ${selectedSize === sizeInfo.size ? 'border-gray-700 bg-gray-100' : ''}`}
                    disabled={isOutOfStock}
                  >
                    <div className="text-sm font-medium">{sizeInfo.size}</div>
                    <div className="text-sm font-medium">₹{sizeInfo.price.toLocaleString('en-IN')} <span className="text-xs text-gray-500 line-through"> ₹{sizeInfo.oldPrice.toLocaleString('en-IN')}</span></div>
                    {sizeInfo.oldPrice && (
                      <div className="text-xs text-green-600">
                        {calculateDiscount(sizeInfo)}% off
                      </div>
                    )}
                    <div className={`text-xs ${isOutOfStock ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                      {isOutOfStock ? 'Out of stock' : 'available'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}