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
      }, 500); // Reduced duration for faster transition
      return () => clearTimeout(hideTimer);
    }, 3000); // Reduced loading time

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-32 h-32 mb-4"
          >
            {/* Simplified logo container */}
            <div className="absolute inset-0 rounded-full bg-gray-50 flex items-center justify-center shadow-md">
              <motion.div
                animate={{
                  scale: [0.95, 1, 0.95]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-20 h-20"
              >
                <Image
                  src="/images/brand-logo.png"
                  alt="Brand Logo"
                  fill
                  className="object-contain"
                  loading="eager"
                  sizes="(max-width: 80px) 100vw, 80px"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Simplified loading indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1.5 h-1.5 rounded-full bg-gray-600"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
