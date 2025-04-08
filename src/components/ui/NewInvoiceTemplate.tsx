import React from 'react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  name: string;
  nickname?: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    pincode?: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
}

interface NewInvoiceTemplateProps {
  order: Order;
}

const NewInvoiceTemplate: React.FC<NewInvoiceTemplateProps> = ({ order }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-2 max-w-8xl mx-auto print:p-8 print:my-8">
      {/* Header with Brand Logo */}
      <div className="flex justify-between items-start mb-4 print:mb-4 page-break-inside-avoid">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            <Image
              src="/images/brand-logo.png"
              alt="AKX Brand Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-gray-600">
            <p className="text-sm">AKX Brand, Matta Chowk</p>
            <p className="text-sm">Panipat, Haryana </p>
            <p className="text-sm">132103, India</p>
            <p className="text-sm mt-2">GSTIN: 06BPQPR1739P1ZZ</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-3 rounded-lg">
            <h3 className="text-2xl font-bold">INVOICE</h3>
            <p className="text-sm opacity-90 mt-1">Order Id: <br />#{order.id}</p>
          </div>
          <p className="text-gray-600 mt-4">Date: {new Date(order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          })}</p>
        </div>
      </div>

      {/* Billing and Shipping Information */}
      <div className="grid grid-cols-2 gap-4 mb-10 print:mb-6 page-break-inside-avoid">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To</h3>
          <div className="text-gray-600">
            <p className="font-medium text-gray-900">{order.customerName}</p>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.state} - {order.address.pincode || order.address.zipCode}</p>
            <div className="pt-1 mt-1 border-t border-gray-100">
              <p className="text-sm break-words">{order.email}</p>
              <p className="text-sm">{order.phone}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Method</span>
              <span className="font-medium text-gray-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {order.paymentStatus === 'completed' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-4 print:mb-4">
        <table className="w-full">
          <thead className="print:table-header-group">
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Item</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Details</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Qty</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 print:break-inside-avoid">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>

                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                {item.nickname && (
                    <p className="text-sm text-gray-700 mb-1">Nickname: {item.nickname}</p>
                  )}
                  <hr />
                  <p>Size: {item.size}</p>
                 
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Summary */}
      <div className="flex justify-end mb-4 print:mb-6 print:break-inside-avoid">
        <div className="w-80 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900">Free</span>
            </div>
            <div className="pt-1 mt-1 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-gray-100 pt-2 print:pt-2 print:mt-4 print:break-inside-avoid">
        <div className="max-w-sm mx-auto">
          <p className="text-sm font-medium text-gray-900">Thank you for shopping with AKX Brand!</p>
          <p className="text-sm text-gray-600 mt-1">For any queries, please contact us at</p>
          <p className="text-sm text-blue-600 break-words">akxbrand@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default NewInvoiceTemplate;