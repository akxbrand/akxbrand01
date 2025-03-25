"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface FiltersProps {
  priceRange: { min: number; max: number };
  selectedCategories: string[];
  selectedSubcategories: string[];
  onPriceChange: (min: number, max: number) => void;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
  onClearAll: () => void;
}

interface Category {
  id: string;
  name: string;
  count: number;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  count: number;
}

export default function Filters({
  priceRange,
  selectedCategories = [], // Add default empty array
  selectedSubcategories = [], // Add default empty array
  onPriceChange,
  onCategoryChange,
  onSubcategoryChange,
  onClearAll
}: FiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        // Ensure subcategories are properly structured in the response
        const categoriesWithSubcategories = (data.categories || []).map((category: any) => ({
          id: category?.id || '',
          name: category?.name || '',
          count: category?.count || 0,
          subcategories: Array.isArray(category?.subCategories) ? category.subCategories.map((sub: any) => ({
            id: sub?.id || '',
            name: sub?.name || '',
            count: sub?.count || 0
          })) : []
        }));
        
        setCategories(categoriesWithSubcategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-64 bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 transform transition-all duration-300 ease-out hover:scale-105 active:scale-95"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => onPriceChange(Number(e.target.value), priceRange.max)}
            className="w-24 px-2 py-1 text-gray-700 border border-gray-300 rounded text-sm"
            placeholder="Min"
          />
          <span className='text-gray-800'>to</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => onPriceChange(priceRange.min, Number(e.target.value))}
            className="w-24 px-2 py-1 text-gray-700 border border-gray-300 rounded text-sm"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Categories and Subcategories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onCategoryChange(category.id)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="ml-auto text-xs text-gray-400">({category.count})</span>
              </label>
              {selectedCategories.includes(category.id) && category.subcategories && category.subcategories.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <label key={subcategory.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(subcategory.id)}
                        onChange={() => onSubcategoryChange(subcategory.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">{subcategory.name}</span>
                      <span className="ml-auto text-xs text-gray-400">({subcategory.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
