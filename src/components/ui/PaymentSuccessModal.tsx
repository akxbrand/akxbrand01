'use client';

import React from 'react';
import Modal from './Modal';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

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
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon
            className="h-8 w-8 text-green-600"
            aria-hidden="true"
          />
        </div>

        <div className="mt-3">
          <h3 className="text-2xl font-semibold text-gray-900">
            Thank You for Your Order!
          </h3>
          <div className="mt-2">
            <p className="text-lg text-gray-600">
              Your order has been successfully placed and payment received.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              Order ID: {orderDetails.orderId}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Total Amount: ₹{orderDetails.total.toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Items: {orderDetails.items.length}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            We'll send you shipping confirmation and an order update via email.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onClose}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </Modal>
  );
}