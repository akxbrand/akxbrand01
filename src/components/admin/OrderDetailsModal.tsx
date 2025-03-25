"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { X } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Order ID</p>
            <p className="font-medium">{order.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Order Date</p>
            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
          <div className="space-y-2">
            <p><span className="text-gray-500">Name:</span> {order.customer.name}</p>
            <p><span className="text-gray-500">Email:</span> {order.customer.email}</p>
            {order.customer.phone && (
              <p><span className="text-gray-500">Phone:</span> {order.customer.phone}</p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
          <p className="text-gray-600">{order.shippingAddress}</p>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">₹{item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">Total Amount</p>
            <p className="text-xl font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}