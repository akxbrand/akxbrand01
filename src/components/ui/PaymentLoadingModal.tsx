'use client';

import React from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PaymentLoadingModalProps {
  isOpen: boolean;
  message: string;
}

export default function PaymentLoadingModal({
  isOpen,
  message
}: PaymentLoadingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mx-auto p-6"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            rotate: { 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }
          }}
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg"
        >
          <Loader2
            className="h-10 w-10 text-white animate-spin"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="text-2xl font-semibold text-gray-900">
            {message}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Please do not close this window
          </p>
        </motion.div>
      </motion.div>
    </Modal>
  );
}