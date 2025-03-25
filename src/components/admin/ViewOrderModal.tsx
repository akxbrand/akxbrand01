"use client";

const printStyles = `
  @media print {
    .not-printable {
      display: none !important;
    }
  }
`;

import React from 'react';
import Modal from '@/components/ui/Modal';
import { X, Download, Printer } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  nickname?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  orderDate: string;
  paymentMethod: string;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export default function ViewOrderModal({ isOpen, onClose, order }: ViewOrderModalProps) {
  console.log('ViewOrderModal:', { isOpen, order });

  // const handlePrint = () => {
  //   window.print();
  // };

  const handleDownloadInvoice = () => {
    // Create a new window for the invoice
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Write the invoice content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total-section { margin-top: 30px; text-align: right; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div id="printable-content">
            ${document.getElementById('printable-content')?.innerHTML || ''}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <style>{printStyles}</style>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose}>
          {/* <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"> */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Order Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </button>
            {/* <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button> */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="print:block" id="printable-content">
          {/* Invoice Header */}
          <div className="flex justify-between mb-8 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600">Order #{order.id}</p>
              <p className="text-gray-600">Date: {order.orderDate}</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900">AKX Brand</h3>
              <p className="text-gray-600">33/10 Matta Chowk, Rani Mahal</p>
              <p className="text-gray-600">Panipat, Haryana 132103</p>
              <p className="text-gray-600">GSTIN: 06BPQPR1739P1ZZ</p>
            </div>
          </div>

          {/* Customer Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="mb-4 not-printable">
              <h4 className="text-gray-600 text-sm font-medium mb-2">Customer Details:</h4>
              <p className="font-medium text-gray-900">{order.customerName}</p>
              {order.nickname && (
                <p className="text-gray-600">Nickname: {order.nickname}</p>
              )}
              </div>
              <div className="print:block">
              <h4 className="text-gray-600 text-sm font-medium mb-2">Bill To:</h4>
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <p className="text-gray-600">{order.email}</p>
              <p className="text-gray-600">{order.phone}</p>
              <p className="text-gray-600">{order.address.street}</p>
              <p className="text-gray-600">
                {order.address.city}, {order.address.state} {order.address.zipCode}
              </p>
              </div>
            </div>
            <div>
              <h4 className="text-gray-600 text-sm font-medium mb-2">Payment Information:</h4>
              <p className="text-gray-600">Method: {order.paymentMethod}</p>
              <p className="text-gray-600">Status: {order.status}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 relative flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800 font-medium">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  {/* <span className="text-gray-600">Tax (18% GST):</span> */}
                  <span className="text-gray-600">Shipping Fee:</span>
                  <span className="text-gray-800 font-medium">₹0 (Free)</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-gray-800">₹{(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Thanks for your order!</p>
            <p>For any queries, please contact us at akxbrand@gmail.com</p>
          </div>
        </div>
        {/* </div> */}
      </Modal>
      )}
    </>
  );
}
