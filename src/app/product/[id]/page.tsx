"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Share2, X, Plus } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import Layout from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Toast from '@/components/ui/Toast';
import { Review, ReviewStats } from '@/types/review';
import { useSession } from 'next-auth/react';
import AnimatedEye from '@/components/ui/AnimatedEye';
import CountdownTimer from '@/components/ui/CountdownTimer';
import Preloader from '@/components/ui/preloader';

interface Specifications {
  [key: string]: string | undefined;
  dimensions?: string;
}

interface ProductSize {
  id: string;
  size: string;
  description?: string;
  uniqueFeatures?: string;
  productDetails?: { [key: string]: string };
  careInstructions?: string;
  deliveryReturns?: {
    deliveryInfo?: string;
    returnPolicy?: string;
  };
  oldPrice?: number;
  price: number;
  stock: number;
  isLimitedTimeDeal: boolean;

  dealStartTime?: Date;
  dealEndTime?: Date;
  dealQuantityLimit?: number;
}

interface Product {
  id: string;
  name: string;
  nickname?: string;
  description?: string;
  isLimitted?: boolean;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
  oldPrice?: number;
  price: number;
  stock: number;
  status: string;
  isLimitedTimeDeal: boolean;
  dealStartTime?: Date;
  dealEndTime?: Date;
  dealQuantityLimit?: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  weeklySales: number;
  sizes: ProductSize[];
  reviews: Review[];
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  // const productId:string = params.id;
  const param = useParams(); // Unwrap the params using `use()`
  const productId = Array.isArray(param?.id) ? param.id[0] : param?.id ?? '';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [reviewPhotoUrls, setReviewPhotoUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { data: session } = useSession();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    mediaCount: { photo: 0, video: 0 }
  });
  const [viewerCount, setViewerCount] = useState<number>(Math.floor(Math.random() * 291) + 10);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Transform the features, details, and care instructions if they're strings
      const transformedProduct = {
        ...data.product,
        uniqueFeatures: data.product.uniqueFeatures ?
          (typeof data.product.uniqueFeatures === 'string' ?
            data.product.uniqueFeatures.split('\n') :
            data.product.uniqueFeatures) :
          [],
        careInstructions: data.product.careInstructions ?
          (typeof data.product.careInstructions === 'string' ?
            data.product.careInstructions.split('\n') :
            data.product.careInstructions) :
          [],
        productDetails: data.product.productDetails ?
          (typeof data.product.productDetails === 'string' ?
            JSON.parse(data.product.productDetails) :
            data.product.productDetails) :
          {},
        deliveryReturns: data.product.deliveryReturns ?
          (typeof data.product.deliveryReturns === 'string' ?
            JSON.parse(data.product.deliveryReturns) :
            data.product.deliveryReturns) :
          {}
      };

      setProduct(transformedProduct);

      setProduct(data.product);
      if (data.product.category?.id) {
        fetchRelatedProducts(data.product.category.id);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch product');
      setToastMessage('Error loading product details');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/products?categories=${categoryId}&limit=4`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Filter out the current product
      const filtered = data.products.filter((p: Product) => p.id !== productId);
      setRelatedProducts(filtered.slice(0, 4));
    } catch (error) {
      // console.error('Error fetching related products:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);


  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 291) + 10);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to fetch reviews';
        throw new Error(errorMessage);
      }

      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (error) {
      // console.error('Error fetching reviews:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to fetch reviews');
      setToastType('error');
      setShowToast(true);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    const totalFiles = [...reviewPhotos, ...newFiles];

    if (totalFiles.length > 5) {
      setToastMessage('Maximum 5 photos allowed');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setReviewPhotos(totalFiles);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setReviewPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const handleSubmitReview = async () => {
    if (!session) {
      setToastMessage('Please login to submit a review');
      setToastType('error');
      setShowToast(true);
      router.push('/login');
      return;
    }

    if (reviewRating === 0) {
      setToastMessage('Please select a rating');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setIsSubmittingReview(true);
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', reviewRating.toString());
      formData.append('text', reviewText);
      reviewPhotos.forEach(photo => formData.append('photos', photo));

      const response = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to submit review';
        throw new Error(errorMessage);
      }

      setToastMessage('Review submitted successfully');
      setToastType('success');
      setShowToast(true);
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewText('');
      setReviewPhotos([]);
      setReviewPhotoUrls([]);
      fetchReviews();
    } catch (error) {
      // console.error('Error submitting review:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to submit review');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    return () => {
      reviewPhotoUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [reviewPhotoUrls]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch product');
        if (!data.product) throw new Error('Product data is missing');

        // Ensure all array properties exist before setting the product
        // Parse description to extract sections
        const parseDescription = (description?: string) => {
          const sections: {
            specifications: Specifications;
            careInstructions: string[];
            deliveryInfo: string;
            returnPolicy: string;
          } = {
            specifications: {},
            careInstructions: [],
            deliveryInfo: '',
            returnPolicy: ''
          };

          if (!description) return sections;

          // Split description into paragraphs
          const paragraphs = description.split('\n\n');

          paragraphs.forEach(paragraph => {
            if (paragraph.toLowerCase().includes('dimension') ||
              paragraph.toLowerCase().includes('weight') ||
              paragraph.toLowerCase().includes('material')) {
              const specs = paragraph.split('\n');
              specs.forEach(spec => {
                const [key, value] = spec.split(':').map(s => s.trim());
                if (key && value) {
                  sections.specifications[key.toLowerCase()] = value;
                }
              });
            } else if (paragraph.toLowerCase().includes('care') ||
              paragraph.toLowerCase().includes('wash') ||
              paragraph.toLowerCase().includes('clean')) {
              sections.careInstructions = paragraph
                .split('\n')
                .filter(line => line.trim().length > 0);
            } else if (paragraph.toLowerCase().includes('delivery') ||
              paragraph.toLowerCase().includes('shipping')) {
              sections.deliveryInfo = paragraph;
            } else if (paragraph.toLowerCase().includes('return') ||
              paragraph.toLowerCase().includes('refund')) {
              sections.returnPolicy = paragraph;
            }
          });

          return sections;
        };

        const parsedSections = parseDescription(data.product.description || undefined);
        const processedProduct = {
          ...data.product,
          images: data.product.images || [],
          colors: data.product.colors || [],
          sizes: data.product.sizes || [],
          features: data.product.features || [],
          specifications: parsedSections.specifications,
          careInstructions: parsedSections.careInstructions,
          deliveryInfo: parsedSections.deliveryInfo,
          returnPolicy: parsedSections.returnPolicy
        };

        setProduct(processedProduct);

        if (processedProduct.sizes?.length > 0) {
          setSelectedSize(processedProduct.sizes[0].size);
        }
        if (processedProduct.colors?.length > 0) setSelectedColor(processedProduct.colors[0]);

        // Fetch related products when product data is available
        if (processedProduct.category?.id) {
          fetchRelatedProducts(processedProduct.category.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (change: number) => {
    if (!selectedSize || !product) return;
    const selectedSizeData = product.sizes.find(s => s.size === selectedSize);
    if (!selectedSizeData) return;

    const newQuantity = quantity + change;
    if (change > 0 && newQuantity > selectedSizeData.stock) {
      setToastMessage(`Cannot add more items - only ${selectedSizeData.stock} available in size ${selectedSize}`);
      setToastType('error');
      setShowToast(true);
      return;
    } else if (change < 0 && newQuantity < 1) {
      setToastMessage('Quantity cannot be less than 1');
      setToastType('error');
      setShowToast(true);
      return;
    }
    setQuantity(Math.max(1, newQuantity));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          {/* <Loader2 className="w-8 h-8 animate-spin" /> */}
          <Preloader />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Product not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setToastMessage('Please select a size');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const selectedSizeData = product.sizes?.find(s => s.size === selectedSize);
    const currentCartItem = cartItems.find(item =>
      item.productId === product.id && item.size === selectedSize
    );
    const currentQuantity = currentCartItem?.quantity || 0;
    const totalQuantity = currentQuantity + quantity;

    if (selectedSizeData && totalQuantity > selectedSizeData.stock) {
      setToastMessage(`Cannot add ${quantity} more items - only ${selectedSizeData.stock - currentQuantity} available in size ${selectedSize}`);
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      await addToCart({
        id: `${product.id}-${selectedSize}`,
        productId: product.id,
        name: product.name,
        price: selectedSizeData?.price || product.price,
        image: product.images[0],
        size: selectedSize,
        quantity: quantity
      });
      setToastMessage(`${product.name} added to cart!`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to add item to cart');
      setToastType('error');
      setShowToast(true);
    }
  };



  return (
    <Layout>
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
      {/* Rest of the JSX */}
      <div className="min-h-screen bg-white pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="relative h-[350px] md:h-[400px] rounded-lg overflow-hidden group">
              <Image
                src={product.images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 750px) 100vw, 50vw"
                priority
              />
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${currentImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
              {currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev - 1)}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1.5 sm:p-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {currentImageIndex < product.images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1.5 sm:p-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-medium text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const difference = reviewStats.averageRating - star;
                    return (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${difference >= 0 ? 'text-yellow-400' : difference > -1 ? 'text-yellow-400' : 'text-gray-200'}`}
                        style={{
                          clipPath: difference > -1 && difference < 0
                            ? 'inset(0 ' + (100 - (difference + 1) * 100) + '% 0 0)'
                            : undefined
                        }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="ml-2 text-sm text-gray-500">{reviewStats.totalReviews} reviews ({reviewStats.averageRating.toFixed(1)} average)</span>
              </div>

              {/* Live Viewers Count */}
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="relative">
                    <AnimatedEye size={20} blinkInterval={3000} />
                  </div>
                  <span className="ml-1 font-medium text-xs">{viewerCount} customers are viewing this product</span>
                </div>
              </div>

              {/* Price and Deal Timer */}
              <div className="flex flex-col mt-4 gap-2">

                <div className="flex items-center">

                  {selectedSize ? (
                    <>
                      <span className="text-2xl font-medium text-gray-900">
                        ₹{product.sizes.find(s => s.size === selectedSize)?.price.toLocaleString('en-IN')}
                      </span>
                      {product.sizes.find(s => s.size === selectedSize)?.oldPrice && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-lg text-gray-500 line-through">
                            ₹{product.sizes.find(s => s.size === selectedSize)?.oldPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-md font-medium text-green-600">
                            {Math.round(
                              ((product.sizes.find(s => s.size === selectedSize)?.oldPrice! -
                                product.sizes.find(s => s.size === selectedSize)?.price!) /
                                product.sizes.find(s => s.size === selectedSize)?.oldPrice!) *
                              100
                            )}% off

                          </span>
                          {product.isLimitted && (
                            <div className="relative bg-red-500 ml-5 text-white px-2 py-1 rounded-md text-xs font-medium transform animate-pulse">
                              Limited Deal
                            </div>
                          )}
                        </div>
                      )}
                    </>

                  ) : (
                    <span className="text-lg text-gray-600">Select a size to see price</span>
                  )}
                </div>
                {selectedSize ? (
                  product.sizes.find(s => s.size === selectedSize)?.isLimitedTimeDeal &&
                  product.sizes.find(s => s.size === selectedSize)?.dealEndTime && (
                    <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                      <span className="text-red-600 font-medium text-xs">Limited Time Deal</span>
                      <CountdownTimer
                        endTime={new Date(product.sizes.find(s => s.size === selectedSize)?.dealEndTime || '')}
                        onExpire={() => fetchProduct()}
                      />
                    </div>
                  )
                ) : (
                  product.isLimitedTimeDeal && product.dealEndTime && (
                    <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg">
                      <span className="text-red-600 font-medium">Limited Time Deal</span>
                      <CountdownTimer
                        endTime={new Date(product.dealEndTime)}
                        onExpire={() => fetchProduct()}
                      />
                    </div>
                  )
                )}
              </div>

              {/* Color Selection */}
              {/* {product.colors && product.colors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900">COLOR</h3>
                  <div className="mt-2 flex space-x-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )} */}

              {/* Size Selection */}
              <div className="mt-6 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-900">SIZE</h3>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 mb-8">
                  {product.sizes && product.sizes.map((size) => {
                    const isSelected = selectedSize === size.size;
                    // const discount = size.oldPrice ? Math.round(((size.oldPrice - size.price) / size.oldPrice) * 100) : 0;
                    return (
                      <button
                        key={`${product.id}-${size.id}`}
                        onClick={() => setSelectedSize(size.size)}
                        className={`px-2 py-2 w-[100px] text-sm font-medium rounded-md ${isSelected
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                          } ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={size.stock === 0}
                      >
                        <div className="text-center">
                          <div className="font-medium">{size.size}</div>

                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-8'>
                <div className='flex-shrink-0 space-y-4 sm:space-y-6'>
                  {/* Quantity */}
                  <div className='w-30'>
                    <h3 className="text-sm font-medium text-gray-900">QUANTITY</h3>
                    <div className="mt-2 flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-8 h-8 text-gray-500 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-gray-900">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-8 h-8 text-gray-500 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-900">STOCK STATUS</h3> */}
                  <div className="mt-6 items-center">
                    {selectedSize ? (
                      product.sizes.find(s => s.size === selectedSize)?.stock === 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : product.sizes.find(s => s.size === selectedSize)?.stock <= 10 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Limited Stock
                        </span>
                      ) : (
                        null
                      )
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Select Size
                      </span>
                    )}
                  </div>
                </div>

              </div>
              {/* Weekly Sales Status */}
              {product.weeklySales ? (
                <div className="">
                  {/* <h3 className="text-sm font-medium text-gray-900">WEEKLY SALES</h3> */}
                  <div className="mt-1 rounded-lg p-1">
                    <div className="flex items-center">
                      <div className="animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-2 text-sm text-red-600"><b className='text-lg'>{product.weeklySales} </b>units sold this week</div>
                    </div>
                  </div>
                </div>
              ) : null}


              {/* Add to Cart & Buy Now */}
              <div className="mt-2 flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                    (selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0)
                  }
                  className={`flex-1 px-6 py-3 rounded-md transition-colors duration-200 ${(product.sizes && product.sizes.length > 0 && !selectedSize) ||
                    (selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800'
                    } text-white`}
                >
                  {selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0
                    ? 'Out of Stock'
                    : (product.sizes && product.sizes.length > 0 && !selectedSize)
                      ? 'Select Size'
                      : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    const selectedSizeData = product.sizes?.find(s => s.size === selectedSize);
                    const productDetails = {
                      id: params.id,
                      name: product.name,
                      price: selectedSizeData?.price || product.price,
                      color: selectedColor,
                      size: selectedSize,
                      quantity: quantity,
                      image: product.images[0]
                    };
                    router.push(`/checkout?product=${encodeURIComponent(JSON.stringify(productDetails))}`);
                  }}
                  disabled={
                    (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                    (selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0)
                  }
                  className={`flex-1 border px-6 py-3 rounded-md transition-colors duration-200 ${(product.sizes && product.sizes.length > 0 && !selectedSize) ||
                    (selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0)
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  {selectedSize && product.sizes?.find(s => s.size === selectedSize)?.stock === 0
                    ? 'Out of Stock'
                    : (product.sizes && product.sizes.length > 0 && !selectedSize)
                      ? 'Select Size'
                      : 'Buy Now'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: product?.name || 'Product',
                          text: product?.description || '',
                          url: window.location.href
                        });
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        setToastMessage('Link copied to clipboard!');
                        setToastType('success');
                        setShowToast(true);
                      }
                    } catch (error) {
                      // console.error('Error sharing:', error);
                      setToastMessage('Failed to share');
                      setToastType('error');
                      setShowToast(true);
                    }
                  }}
                  className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

            </div>


          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
              {/* Secure Payment */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-12">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Secure Payment</h3>
                  <p className="text-sm text-gray-500">100% secure payment processing</p>
                </div>
              </div>

              {/* Fast Delivery */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-12">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Fast Delivery</h3>
                  <p className="text-sm text-gray-500">2-3 business days delivery</p>
                </div>
              </div>

              {/* Payment Options */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-12">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Multiple Payment Options</h3>
                  <p className="text-sm text-gray-500">UPI, Cards & More</p>
                </div>
              </div>

              {/* Quality Assurance */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-12">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Quality Assurance</h3>
                  <p className="text-sm text-gray-500">Premium quality guaranteed</p>
                </div>
              </div>

              {/* Customer Support */}
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center transform transition-transform group-hover:rotate-12">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">24/7 Support</h3>
                  <p className="text-sm text-gray-500">Always here to help you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 px-4 sm:px-6 lg:px-8">
          {/* Description Section */}
          <div className="border-t border-gray-200">
            <button
              className="w-full py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setActiveSection(activeSection === 'description' ? '' : 'description')}
            >
              <h2 className="text-xl font-medium text-gray-900">Description</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeSection === 'description' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === 'description' && (
              <div className="pb-6 px-4">
                <p className="text-gray-600">
                  {selectedSize && product.sizes.find(s => s.size === selectedSize)?.description || product.description}
                </p>
              </div>
            )}
          </div>

          {/* Unique Features */}
          <div className="border-t border-gray-200">
            <button
              className="w-full py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setActiveSection(activeSection === 'features' ? '' : 'features')}
            >
              <h2 className="text-xl font-medium text-gray-900">Unique Features</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeSection === 'features' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === 'features' && (
              <div className="pb-6 px-4">
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200">
            <button
              className="w-full py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setActiveSection(activeSection === 'details' ? '' : 'details')}
            >
              <h2 className="text-xl font-medium text-gray-900">Product Details</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeSection === 'details' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === 'details' && (
              <div className="pb-6 px-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedSize ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Size</h3>
                        <p className="mt-1 text-sm text-gray-500">{selectedSize}</p>
                      </div>
                      {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <h3 className="text-sm font-medium text-gray-900">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                          <p className="mt-1 text-sm text-gray-500">{value}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key}>
                        <h3 className="text-sm font-medium text-gray-900">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <p className="mt-1 text-sm text-gray-500">{value}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Care Instructions */}
          <div className="border-t border-gray-200">
            <button
              className="w-full py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setActiveSection(activeSection === 'care' ? '' : 'care')}
            >
              <h2 className="text-xl font-medium text-gray-900">Care Instructions</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeSection === 'care' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === 'care' && (
              <div className="pb-6 px-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {product.careInstructions?.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Delivery & Returns */}
          <div className="border-t border-gray-200">
            <button
              className="w-full py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setActiveSection(activeSection === 'delivery' ? '' : 'delivery')}
            >
              <h2 className="text-xl font-medium text-gray-900">Delivery & Returns</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeSection === 'delivery' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === 'delivery' && (
              <div className="pb-6 px-4">
                <div className="space-y-4">
                  {product.deliveryInfo && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Delivery Information</h3>
                      <p className="mt-1 text-sm text-gray-600">{product.deliveryInfo}</p>
                    </div>
                  )}
                  {product.returnPolicy && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Return Policy</h3>
                      <p className="mt-1 text-sm text-gray-600">{product.returnPolicy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>


        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Customer Reviews</h2>

            {/* Review Summary */}
            <div className="flex items-start gap-8 mb-8">
              <div className="flex-shrink-0">
                <div className="text-5xl font-medium text-gray-900 mb-2">{reviewStats.averageRating.toFixed(1)}</div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`h-5 w-5 ${i < Math.floor(reviewStats.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-sm text-gray-500">Based on {reviewStats.totalReviews} reviews</div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-grow">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center mb-2">
                    <div className="w-12 text-sm text-gray-600">{rating} stars</div>
                    <div className="flex-grow mx-3 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${reviewStats.ratingDistribution[rating] || 0}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500 text-right">
                      {`${Math.round(reviewStats.ratingDistribution[rating] || 0)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Write Review Button and Modal */}
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mb-8 bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Write a Review
            </button>

            {/* Review Modal */}
            {isReviewModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  {/* Background overlay */}
                  <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={() => setIsReviewModalOpen(false)}
                  >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>

                  {/* Modal panel */}
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Write a Review</h3>
                        <button
                          onClick={() => setIsReviewModalOpen(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none"
                              >
                                <svg
                                  className={`h-8 w-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Text */}
                        <div>
                          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                          </label>
                          <textarea
                            id="review"
                            rows={4}
                            className="shadow-sm p-2 text-gray-700 resize-none focus:ring-gray-900 focus:border-gray-900 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Share your thoughts about the product..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                          />
                        </div>

                        {/* Photo Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Photos (optional)
                          </label>
                          <div className="flex items-center space-x-4">
                            {reviewPhotos.map((photo, index) => (
                              <div key={index} className="relative w-20 h-20">
                                <Image
                                  src={URL.createObjectURL(photo)}
                                  alt={`Review photo ${index + 1}`}
                                  fill
                                  className="object-cover rounded-lg"
                                />

                                <button
                                  onClick={() => handleRemovePhoto(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            {reviewPhotos.length < 3 && (
                              <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handlePhotoUpload}
                                />
                                <Plus className="h-6 w-6 text-gray-400" />
                              </label>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">You can upload up to 3 photos</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsReviewModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 flex items-center"
                            onClick={handleSubmitReview}
                            disabled={isSubmittingReview}
                          >
                            {isSubmittingReview ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Review'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Review List */}
            <div className="space-y-8 mx-4 sm:mx-6 lg:mx-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{review.text}</h3>
                      <p className="text-sm text-gray-500">By {review.userName} · {review.isVerified && 'Verified Purchase'}</p>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* <div className="mt-2 text-gray-700">{review.text}</div> */}
                  {review.adminNotes && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-700">
                        <span className="font-medium">Admin:</span> {review.adminNotes}
                      </p>
                    </div>
                  )}
                  {review.media && review.media.length > 0 && (
                    <div className="flex gap-4 mb-4 px-4">
                      {review.media.map((media, index) => (
                        <div key={media.id} className="w-20 h-20 relative rounded-lg overflow-hidden">
                          <Image src={media.url} alt={`Review image ${index + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Related Products</h2>
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className="flex-none w-[calc(50%-8px)] sm:w-1/2 lg:w-1/4 snap-start">
                    <ProductCard
                      viewMode="grid"
                      product={{
                        id: relatedProduct.id,
                        name: relatedProduct.name,
                        price: relatedProduct.price,
                        images: relatedProduct.images,
                        category: relatedProduct.category,
                        description: relatedProduct.description || "",
                        stock: relatedProduct.stock || 0,
                        sizes: relatedProduct.sizes || []
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}



