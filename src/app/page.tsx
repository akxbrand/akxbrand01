'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, X } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useCart } from '@/context/CartContext';

import Header from '@/components/layout/Header';
import MobileMenu from '@/components/layout/MobileMenu';
import { useState, useEffect } from 'react';
import Footer from '@/components/layout/Footer';
import SubCategoryModal from '@/components/ui/SubCategoryModal';
import TopProducts from '@/components/TopProducts';
import CustomerReviews from '@/components/CustomerReviews';
interface FeaturedReview {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  text: string;
  media: Array<{
    id: string;
    url: string;
    type: string;
  }>;
}
// import CustomerStories from '@/components/CustomerStories';
import FeatureVideos from '@/components/FeatureVideos';


export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState<Array<any>>([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState<Array<any>>([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [featuredReviews, setFeaturedReviews] = useState<FeaturedReview[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const { addToCart } = useCart();




  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const response = await fetch('/api/reviews/featured');
        const data = await response.json();
        if (data.success) {
          setFeaturedReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error);
      }
    };

    fetchFeaturedReviews();
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch('/api/products/new-arrivals');
        const data = await response.json();
        setNewArrivals(data.products || []);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setNewArrivalsLoading(false);
      }
    };

    const fetchBestSellers = async () => {
      try {
        const response = await fetch('/api/products/best-sellers');
        const data = await response.json();
        setBestSellers(data.products || []);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setBestSellersLoading(false);
      }
    };

    fetchNewArrivals();
    fetchBestSellers();
  }, []);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        const data = await response.json();
        if (data.success) {
          setBanners(data.banners.filter((banner: any) => banner.status === 'active'));
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const currentBannerData = banners[currentBanner];
    const isGif = currentBannerData?.imageUrl?.toLowerCase().endsWith('.gif');
    const interval = isGif ? 20000 : 5000; // 10 seconds for GIFs, 5 seconds for other images

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, currentBanner, banners]);

  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    status: string;
    subCategories: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  }>>([]);

  const [categorySubcategories, setCategorySubcategories] = useState<Record<string, Array<{
    id: string;
    name: string;
    description: string;
    slug: string;
  }>>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          const activeCategories = data.categories.filter((category: any) => category.status === 'Active');
          setCategories(activeCategories);

          // Create a map of category name to subcategories with slug
          const subCategoriesMap = activeCategories.reduce((acc: any, category: any) => {
            acc[category.name] = category.subCategories.map((subCategory: any) => ({
              ...subCategory,
              slug: subCategory.name.toLowerCase().replace(/\s+/g, '-')
            }));
            return acc;
          }, {});
          setCategorySubcategories(subCategoriesMap);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category && category.subCategories.length > 0) {
      setSelectedCategory(categoryName);
      setIsSubCategoryModalOpen(true);
    } else if (category) {
      router.push(`/shop?category=${encodeURIComponent(category.id)}`);
    }
  };

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingProducts, setAddingProducts] = useState<Record<string, boolean>>({});

  const calculateDiscount = (sizeInfo: { price: number; oldPrice?: number }) => {
    if (!sizeInfo.oldPrice) return null;
    const discount = Math.round(((sizeInfo.oldPrice - sizeInfo.price) / sizeInfo.oldPrice) * 100);
    return discount;
  };

  const handleSizeSelect = async (product: any, size: string) => {
    setSelectedSize(size);
    await handleAddToCart(product, size);
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const handleCartButtonClick = (product: any) => {
    if (product.sizes && product.sizes.length === 1) {
      handleAddToCart(product, product.sizes[0].size);
    } else {
      setSelectedProduct(product);
      setShowSizeModal(true);
    }
  };

  const handleAddToCart = async (product: any, size?: string) => {
    setAddingProducts(prev => ({ ...prev, [product.id]: true }));
    try {
      if (size) {
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
      } else {
        await addToCart({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0]
        });
      }
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

  return (
    <div className="min-h-screen bg-white ">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
      <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Hero Section */}
      <section className="relative w-full h-[320px] sm:h-[500px] lg:h-[800px] overflow-hidden flex justify-center pt-20 object-cover" >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">No banners available</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner image'}
                    layout="fill"
                    // objectFit="contain"
                    priority={index === 0}
                    loading="eager"
                    onError={(e) => {
                      console.error('Error loading banner image:', e);
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/banner-second.jpg';
                    }}
                  />
                </div>
                <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
                  {/* Add title and description if needed */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Dots */}
        {banners.length > 0 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentBanner ? 'bg-white w-4' : 'bg-white/50'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Top Products Section */}
      <TopProducts />

      {/* Categories Section */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-12">
            Categories
          </h2>
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide px-2 sm:px-4">
              <div className="flex space-x-4 sm:space-x-8 pb-4 mx-auto">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className="flex-none w-[200px] sm:w-[300px] group relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div>
                    <div className="relative h-[200px] sm:h-[300px] w-full">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                        <h3 className="text-2xl font-bold mb-4">{category.name}</h3>
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className="bg-white text-gray-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-300"
                        >
                          Shop Now
                        </button>
                      </div>
                    </div>
                    </div>
                     <h3 className="text-lg text-gray-800 text-center font-bold mb-2">{category.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* New Arrivals Section */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Latest Arrivals</h2>
          {newArrivalsLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              {/* <Preloader />  */}
            </div>

          ) : newArrivals.length === 0 ? (
            <div className="text-center text-gray-500">No Latest Arrivals available</div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide px-2 scroll-smooth">
                <div className="flex space-x-4 pb-2 mx-auto">
                  {newArrivals.map((product) => (
                    <div key={product.id} className="flex-none w-[200px] group relative rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:scale-105">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="relative h-[200px] w-full">
                          {product.isLimitted && (
                            <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium transform animate-pulse">
                              Limited Deal
                            </div>
                          )}
                          <Image
                            src={product.images[0] || '/images/brand-logo.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />

                        </div>
                        <div className="p-3">
                          <div className="flex text-xs text-gray-500 mb-1 items-center truncate">
                            {product.category?.name} {product.subCategory?.name && <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />} {product.subCategory?.name}
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
                            <span className="ml-1.5 text-xs text-gray-500">{product.rating.toFixed(1) || 0}</span>
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
                            {/* {product.oldPrice && (
                            <div className="absolute bottom-14 right-10 text-green-600 px-1.5 py-0.5 rounded text-xs font-medium">
                              {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% off
                            </div>
                          )} */}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCartButtonClick(product);
                            }}
                            className={`mt-2 w-full bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors duration-300 ${addingProducts[product.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={addingProducts[product.id]}
                          >
                            {addingProducts[product.id] ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6 sm:mb-12">Best Sellers</h2>
          {bestSellersLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="text-center text-gray-500">No best sellers available</div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide px-2 scroll-smooth scroll-container">
                <div className="flex space-x-4 pb-2 mx-auto">
                  {bestSellers.map((product) => (
                    <div key={product.id} className="flex-none w-[200px] group relative rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:scale-105">
                      <Link href={`/product/${product.id}`} className="block">
                        <div className="relative h-[200px] w-full">
                          {product.isLimitted && (
                            <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium transform animate-pulse">
                              Limited Deal
                            </div>
                          )}
                          <Image
                            src={product.images[0] || '/images/bedroom-1.jpg'}
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
                            {product.category?.name} {product.subCategory?.name && <><ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" /> {product.subCategory.name}</>}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center mt-1.5">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="ml-1.5 text-xs text-gray-500">{product.rating.toFixed(1) || 0}</span>
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
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCartButtonClick(product);
                            }}
                            className={`mt-2 w-full bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800 transition-colors duration-300 ${addingProducts[product.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={addingProducts[product.id]}
                          >
                            {addingProducts[product.id] ? 'Adding...' : 'Add to Cart'}
                          </button>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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
              {(selectedProduct.sizes || []).map((sizeInfo: any) => {
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

      {/* Special Offer Section */}
      <section className="relative w-full h-[270px] sm:h-[40em] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 w-full mx-auto">
          <Image
            src="/images/banner-second.jpg"
            alt="Special Offer"
            layout='fill'
            className="brightness-80"
          />
        </div>
      </section>


      {/* Featured Videos Section */}
      <FeatureVideos />

      
      {/* Customer Top Review Section */}
      <CustomerReviews reviews={featuredReviews} />

      <SubCategoryModal
        isOpen={isSubCategoryModalOpen}
        onClose={() => setIsSubCategoryModalOpen(false)}
        categoryName={selectedCategory}
        categoryId={categories.find(cat => cat.name === selectedCategory)?.id || ''}
        subCategories={categorySubcategories[selectedCategory as keyof typeof categorySubcategories] || []}
      />
      <Footer />
    </div>
  );
}
