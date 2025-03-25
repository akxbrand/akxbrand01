"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Image from 'next/image';


export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to subscribe to newsletter');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <footer className="bg-[#2B4055] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            {/* <h3 className="text-2xl font-bold mb-4">AKX Brand</h3> */}
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              {/* AKX Brand */}
              <Image
              src="/images/brand-logo.png"
              alt="AKX Brand Logo"
              width={210}
              height={80}
              className="flex items-center justify-center mb-5 filter invert"
            />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Premium bedding essentials for your perfect night's rest.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">33/10 Matta Chowk, Rani Mahal</p>
              <p className="text-gray-300">Panipat, Haryana - 132103</p>
              <p className="text-gray-300 hover:text-white transition-colors duration-200">
                <a href="mailto:akxbrand@gmail.com">akxbrand@gmail.com</a>
              </p>
              <p className="text-gray-300">+91 9034366104</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700 pt-1 pb-8">
          <div className="max-w-md mx-auto text-center mb-8">
            <h3 className="text-lg font-semibold mb-4">Stay Connected with AKX Brand</h3>
            <p className="text-gray-300 text-sm mb-6">
              Subscribe to our newsletter for exclusive offers, new arrivals, and insider updates.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-md sm:rounded-l-none hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <p className="text-gray-400 text-xs mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AKX Brand. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/akxbrand/" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaInstagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
