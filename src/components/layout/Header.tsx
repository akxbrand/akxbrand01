'use client';

import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import AnnouncementBar from './AnnouncementBar';
import Image from 'next/image';
import CategoryMenu from '../ui/CategoryMenu';

import { FiShoppingCart, FiUser, FiPackage } from 'react-icons/fi';

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isSearchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md shadow-sm">
      <AnnouncementBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              {/* AKX Brand */}
              <Image
                src="/images/brand-logo.png"
                alt="AKX Brand Logo"
                width={90}
                height={80}
                className="flex items-center justify-center"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="relative text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>

            {/* Categories Dropdown */}
            <div className='py-2'><CategoryMenu /></div>

            {/* <div className="relative group">
              <button className="relative text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 group">
                <span>Categories</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>
              <div className="absolute top-full left-0 w-48 py-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="relative group/item hover:bg-gray-50">
                  <Link
                    href="/shop/bedsheets"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>Bedsheets</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                  <div className="absolute left-full top-0 w-48 py-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200">
                    <Link href="/shop/bedsheets/single" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Single Bed</Link>
                    <Link href="/shop/bedsheets/double" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Double Bed</Link>
                    <Link href="/shop/bedsheets/king" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">King Size</Link>
                  </div>
                </div>
                <div className="relative group/item hover:bg-gray-50">
                  <Link
                    href="/shop/comforters"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>Comfort</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                  <div className="absolute left-full top-0 w-48 py-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200">
                    <Link href="/shop/comforters/winter" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Winter</Link>
                    <Link href="/shop/comforters/summer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Summer</Link>
                    <Link href="/shop/comforters/allseason" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Season</Link>
                  </div>
                </div>
                <div className="relative group/item hover:bg-gray-50">
                  <Link
                    href="/shop/blankets"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span>Blankets</span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Link>
                  <div className="absolute left-full top-0 w-48 py-2 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200">
                    <Link href="/shop/blankets/cotton" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cotton</Link>
                    <Link href="/shop/blankets/wool" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wool</Link>
                    <Link href="/shop/blankets/fleece" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Fleece</Link>
                  </div>
                </div>
              </div>
            </div> */}

            {[{ href: '/shop', label: 'Shop' },
            { href: '/bulk-orders', label: 'Bulk Orders' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-gray-700 hover:text-gray-900 transition-colors duration-200 py-2 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search Products"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
            >
              <span className="relative z-10">
                <Search className="h-5 w-5" />
              </span>
              <span className="absolute inset-0 w-full h-full rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>

            <Link
              href="/cart"
              title="My Cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
            >
              <span className="relative z-10">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </span>
              <span className="absolute inset-0 w-full h-full rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <Link href="/orders" title="My Orders" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 group">
              <span className="absolute inset-0 w-full h-full rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
              <FiPackage size={20} />
            </Link>
            <Link
              href="/account"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
              title="Profile"
            >
              <span className="relative z-10" >
                <User className="h-5 w-5"  />
              </span>
              <span className="absolute inset-0 w-full h-full rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
            />
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4"
            >
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-12 py-3 border-2 text-gray-900 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 transition-colors duration-200"
                    autoFocus
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>
                <div className="mt-4 text-sm text-gray-500">
                  Press ESC to close
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
