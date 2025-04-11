'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useNetworkStatus } from '@/components/providers/NetworkStatusProvider';

export default function NetworkError() {
  const router = useRouter();
  const { isOnline, hasVisitedBefore } = useNetworkStatus();

  const handleRetry = () => {
    if (isOnline) {
      router.back();
    } else {
      // If still offline, attempt to refresh the page
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-lg w-full p-6 sm:p-8 md:p-10 bg-white rounded-2xl shadow-2xl text-center relative overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="mb-8 sm:mb-10"
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-indigo-50 rounded-full animate-pulse"></div>
              <svg
                className="relative z-10 w-full h-full text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15zm9-9.5l6 6m0-6l-6 6"
                />
              </svg>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              {hasVisitedBefore ? "Connection Lost" : "Network Connection Error"}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-md mx-auto">
              {hasVisitedBefore
                ? "Looks like we lost connection to our servers. Don't worry, this happens sometimes."
                : "We're having trouble connecting to our servers. Please check your internet connection and try again."}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="inline-flex items-center justify-center bg-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}