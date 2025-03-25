"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
// import Footer from "@/components/layout/Footer";

export default function NotFound() {
  useEffect(() => {
    // Add a class to prevent scrolling on the body when the 404 page is shown
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col ">
        <Header onMobileMenuClick={() => {}} />
        <MobileMenu isOpen={false} onClose={() => {}} />
      </div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg text-center">
          {/* Animated 404 Text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-9xl font-bold text-gray-900 tracking-tight">
              404
            </h1>
            <div className="absolute -bottom-4 left-0 w-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="h-1 bg-gradient-to-r from-gray-200 via-gray-900 to-gray-200"
              />
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 space-y-2"
          >
            <h2 className="text-2xl font-semibold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-gray-600">
              Oops! The page you're looking for seems to have wandered off into
              the digital wilderness.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 space-y-4"
          >
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Return Home
            </Link>
            <div className="flex justify-center space-x-4 mt-4">
              <Link
                href="/shop"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Browse Shop
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-gray-50 text-sm text-gray-500">
                  AKX Brand
                </span>
              </div>
            </div>
          </motion.div>

          {/* Background Decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-30">
                <div className="absolute inset-0 rotate-45 transform-gpu">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer/> */}
    </div>
  );
}
