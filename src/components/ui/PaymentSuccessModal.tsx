'use client';

import React from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, Mail, CreditCard } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    total: number;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  };
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  orderDetails
}: PaymentSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg mx-auto"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-lg"
        >
          <CheckCircle2
            className="h-10 w-10 text-white"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Thank You for Your Order!
          </h3>
          <div className="mt-3">
            <p className="text-lg text-gray-600">
              Your order has been successfully placed and payment received.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-100"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Order ID
                </p>
                <p className="text-sm text-gray-600">
                  {orderDetails.orderId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Items
                </p>
                <p className="text-sm text-gray-600">
                  {orderDetails.items.length} items
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Total Amount
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{orderDetails.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center justify-center space-x-2 text-gray-600"
        >
          <Truck className="h-5 w-5" />
          <p className="text-sm">
            We'll send you shipping confirmation and order updates soon
          </p>
        </motion.div>
{/* 
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <button
            type="button"
            className="w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </motion.div> */}
      </motion.div>
    </Modal>
  );
}