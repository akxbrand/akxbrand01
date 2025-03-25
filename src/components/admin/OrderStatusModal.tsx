"use client";

import React from 'react';
import { X } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  orderId: string;
}

const statuses = [
  { value: 'Processing', icon: '🔄', color: 'blue' },
  { value: 'Pending', icon: '⏳', color: 'yellow' },
  { value: 'Shipping', icon: '🚚', color: 'purple' },
  { value: 'Delivered', icon: '✅', color: 'green' },
  { value: 'Failed', icon: '❌', color: 'red' }
];

export default function OrderStatusModal({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
  orderId
}: OrderStatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Update Order Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Order ID: {orderId}
          </p>
          
          <div className="space-y-3">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  onStatusChange(status.value);
                  onClose();
                }}
                className={`w-full p-4 text-left rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                  currentStatus === status.value
                    ? `bg-${status.color}-50 text-${status.color}-700 font-medium shadow-sm`
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3" role="img" aria-label={status.value}>
                      {status.icon}
                    </span>
                    <div>
                      <div className="font-medium">{status.value}</div>
                      <div className="text-xs text-gray-500">
                        {status.value === 'Processing' && 'Order is being processed'
                        || status.value === 'Pending' && 'Awaiting confirmation'
                        || status.value === 'Shipping' && 'Order is on the way'
                        || status.value === 'Delivered' && 'Order has been delivered'
                        || status.value === 'Failed' && 'Order processing failed'}
                      </div>
                    </div>
                  </div>
                  {currentStatus === status.value && (
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-${status.color}-100`}>
                      <svg className={`w-4 h-4 text-${status.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
