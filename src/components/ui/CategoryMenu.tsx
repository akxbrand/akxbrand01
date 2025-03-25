"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown,ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }[];
}

export default function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        if (data.success && data.categories) {
          const transformedCategories = data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/ /g, '-'),
            subCategories: cat.subCategories.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.name.toLowerCase().replace(/ /g, '-'),
              description: sub.description || '',
              imageUrl: sub.imageUrl
            }))
          }));
          setCategories(transformedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
        aria-label="Categories"
      >
        <span>Categories</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {categories.map((category) => (
            <div key={category.id} className="relative group/item">
              <button
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-between"
              >
                <span>{category.name}</span>
                {category.subCategories.length > 0 && (
                  <ChevronRight className="w-4 h-4 ml-2" />
                )}
              </button>
              {category.subCategories.length > 0 && (
                <div className="absolute left-full top-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200">
                  <div className="py-2">
                    {category.subCategories.map((subCategory) => (
                      <a
                        key={subCategory.id}
                        href={`/shop?category=${category.id}&subcategory=${subCategory.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        {subCategory.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}