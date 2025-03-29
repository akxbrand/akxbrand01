'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import preAnimation from '../../../public/animations/pre-animation.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const Preloader = () => {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      const timer = setTimeout(() => {
        setFadeOut(true);
        const hideTimer = setTimeout(() => {
          setShow(false);
        }, 1000);
        return () => clearTimeout(hideTimer);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 transition-all duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/images/brand-logo.png"
            alt="Brand Logo"
            width={700}
            height={500}
            className="opacity-[0.08] object-contain"
            priority
          />
        </div>
        
        <div className="relative flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-64 h-64 mb-8 flex items-center justify-center"
          >
            <div className="w-full h-full relative">
              <Lottie
                animationData={preAnimation}
                loop={true}
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className=" text-sm font-medium text-gray-600 tracking-wider uppercase"
          >
            Loading....
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
