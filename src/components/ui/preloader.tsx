import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      const hideTimer = setTimeout(() => {
        setShow(false);
      }, 800); // Increased duration for smoother transition
      return () => clearTimeout(hideTimer);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-gray-50 to-white transition-all duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-40 h-40 mb-6"
          >
            {/* Animated gradient rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[spin_4s_linear_infinite] opacity-20 blur-sm" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[spin_3s_linear_infinite_reverse] opacity-30 blur-sm" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 animate-[spin_5s_linear_infinite] opacity-20 blur-sm" />
            
            {/* Logo container with glass effect */}
            <div className="absolute inset-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-24 h-24"
              >
                <Image
                  src="/images/brand-logo.png"
                  alt="Brand Logo"
                  fill
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Animated loading indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
              />
            ))}
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm font-medium text-gray-600 tracking-wider"
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
