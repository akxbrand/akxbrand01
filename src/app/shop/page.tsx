"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import Filters from '@/components/shop/Filters';
import { Filter, Grid, List } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Preloader from '@/components/ui/preloader';

interface Product {
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
  category: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
}

const PRODUCTS_PER_PAGE = 36;

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get search query from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    const category = params.get('category');
    const subcategory = params.get('subcategory');

    if (search) {
      setSearchQuery(search);
    }
    if (category) {
      setSelectedCategories([category]);
    }
    if (subcategory) {
      setSelectedSubcategories([subcategory]);
    }
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: PRODUCTS_PER_PAGE.toString(),
        sortBy,
        minPrice: priceRange.min.toString(),
        maxPrice: priceRange.max.toString(),
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      if (selectedCategories.length > 0) {
        queryParams.append('categories', selectedCategories.join(','));
      }

      if (selectedSubcategories.length > 0) {
        queryParams.append('subcategories', selectedSubcategories.join(','));
      }

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // If no products match the filters, set empty array instead of showing all products
      if (data.products.length === 0 && (selectedCategories.length > 0 || selectedSubcategories.length > 0 || searchQuery)) {
        setProducts([]);
        setTotalPages(0);
      } else {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      // console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, priceRange.min, priceRange.max, selectedCategories, searchQuery]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // const handleMaterialChange = (material: string) => {
  //   setSelectedMaterials(prev =>
  //     prev.includes(material)
  //       ? prev.filter(m => m !== material)
  //       : [...prev, material]
  //   );
  //   setCurrentPage(1);
  // };

  // const handleColorChange = (color: string) => {
  //   setSelectedColors(prev =>
  //     prev.includes(color)
  //       ? prev.filter(c => c !== color)
  //       : [...prev, color]
  //   );
  //   setCurrentPage(1);
  // };

  // const handleSizeChange = (size: string) => {
  //   setSelectedSizes(prev =>
  //     prev.includes(size)
  //       ? prev.filter(s => s !== size)
  //       : [...prev, size]
  //   );
  //   setCurrentPage(1);
  // };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategoryId)
        ? prev.filter(s => s !== subcategoryId)
        : [...prev, subcategoryId]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearAll = () => {
    setPriceRange({ min: 0, max: 100000 });
    setSelectedCategories([]);
    // setSelectedMaterials([]);
    // setSelectedColors([]);
    setSelectedSizes([]);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col mb-8 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Our Collection'}
              </h1>
              {/* <div className="w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                      const newUrl = new URL(window.location.href);
                      newUrl.searchParams.set('search', searchQuery);
                      window.history.pushState({}, '', newUrl);
                      fetchProducts();
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
               <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 text-sm">View:</span>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transform transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:shadow-lg ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    <Grid size={18} className="transform transition-transform duration-300 ease-out hover:rotate-90" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transform transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:shadow-lg ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    <List size={18} className="transform transition-transform duration-300 ease-out hover:rotate-90" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label htmlFor="sort" className="text-gray-800 text-sm whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-800 focus:border-gray-900 focus:outline-none focus:ring-gray-900 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
            </div>
            
            {/* Controls */}
           

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden w-full py-2 px-4 bg-gray-900 text-white rounded-md mb-4 flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Filters
            </button>

            {/* Filters Sidebar */}
            <aside className={`
              fixed lg:relative inset-0 z-40 lg:z-0
              transform lg:transform-none
              ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              transition-transform duration-300 ease-in-out
              w-80 lg:w-64 bg-white lg:bg-transparent
              overflow-y-auto
              lg:block
            `}>
              <div className="lg:sticky lg:top-0 p-4 lg:p-0">
                <div className="flex justify-between items-center lg:hidden mb-4">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    {/* <X size={24} /> */}
                  </button>
                </div>
                <Filters
                  priceRange={priceRange}
                  selectedCategories={selectedCategories}
                  selectedSubcategories={selectedSubcategories}
                  onPriceChange={handlePriceChange}
                  onCategoryChange={handleCategoryChange}
                  onSubcategoryChange={handleSubcategoryChange}
                  onClearAll={handleClearAll}
                />
              </div>
            </aside>

            {/* Overlay */}
            {isMobileFiltersOpen && (
              <>
                <div
                  className={`fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                <div
                  className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl p-6 transform transition-transform duration-300 ease-in-out ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                    <button
                      type="button"
                      className="-mr-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={() => setIsMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      {/* <X className="h-6 w-6" aria-hidden="true" /> */}
                    </button>
                  </div>
                  <Filters
                    priceRange={priceRange}
                    selectedCategories={selectedCategories}
                    selectedSubcategories={selectedSubcategories}
                    onPriceChange={handlePriceChange}
                    onCategoryChange={handleCategoryChange}
                    onSubcategoryChange={handleSubcategoryChange}
                    onClearAll={handleClearAll}
                  />
                </div>
              </>
            )}

            <main className="flex-1 min-w-0">
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6' : 'grid-cols-1 gap-4'}`}>
                {loading ? (
                  // <div className="col-span-full flex justify-center items-center py-12">
                  //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  // </div>
                  <Preloader/>
                ) : products.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No products found
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isLimitted={product.isLimitted}
                      viewMode={viewMode}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } ${i === 0 ? 'rounded-l-md' : ''} ${i === totalPages - 1 ? 'rounded-r-md' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}