'use client';

import { 
  X, 
  Home,
  ShoppingBag, 
  Package, 
  Info, 
  Phone, 
  LogIn, 
  ShoppingCart,
  ChevronDown,
  ChevronRight, 
  User
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Category {
  id: string;
  name: string;
  subCategories: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        const activeCategories = data.categories.filter((category: any) => 
          category.status === 'Active'
        );
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '#', label: 'Categories', icon: ShoppingBag, isCategory: true },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/bulk-orders', label: 'Bulk Orders', icon: Package },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Phone },
  ];

  const footerItems = [
    { href: '/login', label: 'Account', icon: User },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-25' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        className={`fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b border-gray-200 opacity-0 transition-opacity duration-300 ${
            isAnimating ? 'opacity-100 delay-150' : ''
          }`}>
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 transform transition hover:scale-105"
              onClick={onClose}
            >
              AKX Brand
            </Link>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 hover:rotate-90 transform"
              onClick={onClose}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 px-6 py-8 overflow-y-auto">
            <div className="space-y-6">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                if (item.isCategory) {
                  return (
                    <div key={item.href} className={`space-y-4 opacity-0 transform transition-all duration-300 ${isAnimating ? 'opacity-100 translate-x-0' : 'translate-x-[-20px]'}`} style={{ transitionDelay: `${150 + index * 50}ms` }}>
                      <button
                        onClick={() => setShowCategories(!showCategories)}
                        className="flex items-center justify-between w-full text-lg font-medium text-gray-900 group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-colors" />
                          <span className="group-hover:text-gray-900 transition-colors">{item.label}</span>
                        </div>
                        {showCategories ? (
                          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                        )}
                      </button>
                      <div className={`pl-8 space-y-3 overflow-hidden transition-all duration-300 ${showCategories ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        {categories.map((category) => (
                          <div key={category.id} className="group">
                            <button
                              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                              className="w-full flex items-center justify-between py-2 text-gray-700 hover:text-gray-900 transition-colors group-hover:bg-gray-50 rounded-lg px-3"
                            >
                              <span className="text-base font-medium">{category.name}</span>
                              {expandedCategory === category.id ? (
                                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 transform" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500 transition-transform duration-200 transform" />
                              )}
                            </button>
                            <div className={`pl-4 space-y-2 overflow-hidden transition-all duration-300 ${expandedCategory === category.id ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                              {category.subCategories.map((subCategory) => (
                                <Link
                                  key={subCategory.id}
                                  href={`/shop?category=${category.name.toLowerCase()}&subcategory=${subCategory.name.toLowerCase()}`}
                                  className="block py-2 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                  onClick={onClose}
                                >
                                  {subCategory.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ml-5 group flex items-center space-x-3 text-lg font-medium text-gray-900 hover:text-gray-600 transform transition-all duration-300 opacity-0 translate-x-[-20px] ${isAnimating ? 'opacity-100 translate-x-0' : ''}`}
                    style={{ transitionDelay: `${150 + index * 50}ms` }}
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-600 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className={`border-t border-gray-200 px-6 py-8 opacity-0 transition-opacity duration-300 ${
            isAnimating ? 'opacity-100 delay-500' : ''
          }`}>
            <div className="space-y-6">
              {footerItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center space-x-3 text-lg font-medium text-gray-900 hover:text-gray-600 transform transition-all duration-300 opacity-0 translate-y-[10px] ${
                      isAnimating
                        ? 'opacity-100 translate-y-0'
                        : ''
                    }`}
                    style={{
                      transitionDelay: `${500 + index * 50}ms`,
                    }}
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-gray-600 transition-colors" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
