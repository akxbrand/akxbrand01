import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

interface InvoiceTemplateProps {
  order: {
    id: string;
    date: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      material?: string;
      threadCount?: number;
      fillPower?: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    transactionId?: string;
    shippingAddress: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto print:p-6">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-10 border-b pb-6">
        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <img
              src="/images/brand-logo.png"
              alt="Brand Logo"
              width="150"
              height="75"
              style={{ objectFit: 'contain' }}
              className="print:filter print:brightness-0"
            />
          </div>
          <div className="text-gray-600 text-sm">
            <p>33/10 Matta Chowk, Rani Mahal</p>
            <p>Panipat, Haryana - 132103</p>
            <p>India</p>
            <p className="mt-2">+91 9034366104</p>
            <p>akxbrand@gmail.com</p>
            <p className="mt-2 font-medium">GSTIN: 06BPQPR1739P1ZZ</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
          <div className="text-gray-600">
            <p className="font-medium">Invoice No: #{order.id}</p>
            <p>Date: {format(new Date(order.date), 'PPP')}</p>
            <p>Due Date: {format(new Date(order.date), 'PPP')}</p>
          </div>
        </div>
      </div>

      {/* Billing and Shipping Information */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-800 font-semibold mb-3 text-lg">Bill To:</h3>
          <div className="text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">{order.customerInfo.name}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm">{order.customerInfo.email}</p>
              <p className="text-sm">{order.customerInfo.phone}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-gray-800 font-semibold mb-3 text-lg">Payment Details:</h3>
          <div className="text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span>Transaction ID:</span>
                <span className="font-mono text-sm">{order.transactionId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 rounded-tl-lg">Item</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Details</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800">Price</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800 rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-700 font-medium">{item.name}</td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {item.size && item.color && (
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Size: {item.size}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Color: {item.color}</span>
                    </span>
                  )}
                  {item.material && (
                    <div className="mt-1">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {item.material} | 
                        {item.threadCount ? `${item.threadCount} Thread Count` : `${item.fillPower} Fill Power`}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-right text-gray-700">{item.quantity}</td>
                <td className="px-4 py-4 text-sm text-right text-gray-700">₹{item.price.toFixed(2)}</td>
                <td className="px-4 py-4 text-sm text-right font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Order Summary */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex justify-end">
          <div className="w-80 bg-gray-50 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{(order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">
                  {(order.shipping || 0) === 0 ? 'Free' : `₹${(order.shipping || 0).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (GST)</span>
                <span className="text-gray-900 font-medium">₹{(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Total Amount</span>
                <span className="text-gray-900 font-bold text-lg">₹{(order.total || (order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)) + (order.shipping || 0) + (order.tax || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Payment Terms</h4>
            <p className="text-sm text-gray-600">Payment is due within 30 days</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Bank Details</h4>
            <div className="text-sm text-gray-600">
              <p>Bank: HDFC Bank</p>
              <p>Account: XXXX-XXXX-XXXX-1234</p>
              <p>IFSC: HDFC0001234</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Notes</h4>
            <p className="text-sm text-gray-600">This is a computer-generated invoice. No signature required.</p>
          </div>
        </div>
        <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
          <p className="font-medium text-gray-700">Thank you for shopping with Himanshi Ecom!</p>
          <p className="mt-2">For any queries, please contact us at support@himanshiecom.com</p>
          <p className="mt-1">© {new Date().getFullYear()} Himanshi Ecom. All rights reserved.</p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default InvoiceTemplate;