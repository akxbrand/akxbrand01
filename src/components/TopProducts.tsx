'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
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

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
      setToastMessage('Product added to cart successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage('Failed to add product to cart');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
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
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft -= 320;
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollLeft += 320;
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>
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
                    {/* {product.oldPrice && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                        {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                      </div>
                    )} */}
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
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                      {product.oldPrice && (
                        <>
                          <span className="text-xs text-gray-500 line-through">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-green-600">{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% off</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 w-full bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}