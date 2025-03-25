"use client";

import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Mail, Phone, ShoppingBag, CreditCard } from 'lucide-react';
import Image from 'next/image';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: string;
  avatar: string;
}

interface ViewCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewCustomerModal({ customer, isOpen, onClose }: ViewCustomerModalProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-lg font-medium">Customer Details</Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 relative flex-shrink-0">
                <Image
                  src={customer.avatar}
                  alt={customer.name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-medium text-gray-900">{customer.name}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                  <span className="ml-2 text-gray-600">Total Orders</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">{customer.orders}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span className="ml-2 text-gray-600">Total Spent</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Status</h4>
              <div className="mt-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  customer.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
