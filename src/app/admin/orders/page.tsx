"use client";

import React, { useState, useEffect } from 'react';
import Toast from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderStatusModal from '@/components/admin/OrderStatusModal';
import ViewOrderModal from '@/components/admin/ViewOrderModal';
import { Eye, Download, FileSpreadsheet } from 'lucide-react';
import prisma from '@/lib/prisma';

type OrderStatus = 'Delivered' | 'Processing' | 'Shipping' | 'Pending' | 'Failed';

const statusStyles = {
  Processing: {
    bg: 'bg-blue-100 text-blue-800',
    hover: 'hover:bg-blue-200',
    dot: 'bg-blue-400'
  },
  Shipping: {
    bg: 'bg-yellow-100 text-yellow-800',
    hover: 'hover:bg-yellow-200',
    dot: 'bg-yellow-400'
  },
  Delivered: {
    bg: 'bg-green-100 text-green-800',
    hover: 'hover:bg-green-200',
    dot: 'bg-green-400'
  },
  Pending: {
    bg: 'bg-orange-100 text-orange-800',
    hover: 'hover:bg-orange-200',
    dot: 'bg-orange-400'
  },
  Failed: {
    bg: 'bg-red-100 text-red-800',
    hover: 'hover:bg-red-200',
    dot: 'bg-red-400'
  }
};

export default function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    customerName: string;
    nickname: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }[];
    total: number;
    orderDate: string;
    status: OrderStatus;
    paymentMethod: string;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleExportOrders = () => {
    const csvHeader = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Order Date',
      'Total Amount',
      'Order Status',
      'Payment Status',
      'Payment Method',
      'Items',
      'Shipping Address'
    ].join(',');

    const csvContent = csvHeader + '\n' +
      orders.map(order => {
        const itemsList = order.items.map(item => `${item.product?.name}(${item.quantity})`).join('; ');
        const shippingAddress = order.shippingAddress ? 
          `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}` : 'N/A';
        
        return [
          order.id,
          order.user.name,
          order.user.email,
          new Date(order.createdAt).toLocaleDateString(),
          order.total.toLocaleString('en-IN'),
          order.status,
          order.paymentStatus,
          order.payment || 'N/A',
          `"${itemsList}"`,
          `"${shippingAddress}"`
        ].join(',');
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInvoice = (orderId: string) => {
    try {
      // Simulating invoice download
      setToastMessage('Invoice downloaded successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error downloading invoice');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        const orderDetails = {
          id: data.id,
          customerName: data.user.name,
          email: data.user.email,
          phone: data.user.phoneNumber,
          address: data.shippingAddress,
          items: data.items.map((item: any) => ({
            id: item.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            image: item.product.images[0] || '/images/placeholder.jpg'
          })),
          total: data.total,
          orderDate: new Date(data.createdAt).toLocaleDateString(),
          status: data.status,
          paymentMethod: data.paymentMode || 'Not specified',
          paymentStatus: data.paymentStatus
        };

        setSelectedOrder(orderDetails);
        setIsViewModalOpen(true);
      } else {
        setToastMessage(data.error || 'Failed to fetch order details');
        setToastType('error');
        setShowToast(true);
      }

    } catch (error) {
      console.error('Error in handleViewOrder:', error);
      setToastMessage('Error loading order details');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as OrderStatus } : order
        ));
        setToastMessage('Order status updated successfully');
        setToastType('success');
      } else {
        setToastMessage(data.error || 'Failed to update order status');
        setToastType('error');
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error updating order status:', error);
      setToastMessage('Failed to update order status');
      setToastType('error');
      setShowToast(true);
    }
  };

  const [orders, setOrders] = useState<Array<{
    id: string;
    status: OrderStatus;
    items: any[];
    user: { name: string; email: string };
    createdAt: string;
    date: string;
    total: number;
    payment: string;
    paymentStatus: string;
  }>>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders');
        const data = await response.json();
        if (response.ok) {
          const formattedOrders = data.map((order: any) => ({
            ...order,
            date: order.createdAt
          }));
          setOrders(formattedOrders);
        } else {
          setToastMessage(data.error || 'Failed to fetch orders');
          setToastType('error');
          setShowToast(true);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setToastMessage('Failed to fetch orders');
        setToastType('error');
        setShowToast(true);
      }
    };

    fetchOrders();
  }, []);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter(order => {
    // Date filter
    const orderDate = new Date(order.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const dateMatch = (!start || orderDate >= start) && (!end || orderDate <= end);

    // Search query filter
    const searchMatch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const statusMatch = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

    return dateMatch && searchMatch && statusMatch;
  });

  const orderStatuses = ['all', 'Processing', 'Shipping', 'Delivered', 'Pending', 'Failed'];

  return (
    <AdminLayout title="Orders Page">
      {selectedOrder && (
        <ViewOrderModal
          isOpen={isViewModalOpen}
          onClose={() => {
            console.log('Closing modal');
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex-1 max-w-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">Manage Orders</h2>
              <p className="text-sm text-gray-500">View and manage customer orders</p>
            </div>
            <button
              onClick={handleExportOrders}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Orders
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID or Customer Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                {orderStatuses.map(status => (
                  <option key={status} value={status.toLowerCase()}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[130px] px-2.5 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[130px] px-2.5 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      <span className="text-xs text-gray-500">{order.items.length} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`px-3 py-1 inline-flex items-center rounded-full text-sm font-medium transition-colors duration-150 ${statusStyles[order.status]?.bg || 'bg-gray-100 text-gray-800'} ${statusStyles[order.status]?.hover || 'hover:bg-gray-200'}`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${statusStyles[order.status]?.dot || 'bg-gray-400'}`} />
                      {order.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.paymentStatus === 'confirmed' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-150"
                        title="View Order"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-150"
                        title="Download Invoice"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderStatusModal
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        currentStatus={orders.find(o => o.id === selectedOrderId)?.status || ''}
        onStatusChange={(newStatus) => handleStatusUpdate(selectedOrderId!, newStatus)}
        orderId={selectedOrderId || ''}
      />
    </AdminLayout>
  );
}
