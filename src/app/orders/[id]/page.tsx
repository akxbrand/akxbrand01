"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Package, Truck, Calendar, CreditCard, Download } from 'lucide-react';
import InvoiceTemplate from '@/components/ui/InvoiceTemplate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Preloader from '@/components/ui/preloader';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id: orderId } = React.use(params);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(`/api/user/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        setError('Error loading order details. Please try again later.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleBuyAgain = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleDownloadInvoice = async () => {
    const invoiceElement = document.getElementById('invoice-template');
    if (!invoiceElement) {
      console.error('Invoice template element not found');
      return;
    }

    try {
      // Create a temporary container with fixed dimensions
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px'; // Fixed width for consistent rendering
      document.body.appendChild(tempContainer);

      // Clone the invoice element into the temporary container
      const invoiceClone = invoiceElement.cloneNode(true) as HTMLElement;
      invoiceClone.style.display = 'block';
      invoiceClone.style.visibility = 'visible';
      invoiceClone.style.width = '100%';
      tempContainer.appendChild(invoiceClone);

      // Ensure all images are loaded
      const images = invoiceClone.getElementsByTagName('img');
      await Promise.all([...images].map(img => {
        if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
        });
      }));

      // Wait for fonts and other resources to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(invoiceClone, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: invoiceClone.offsetHeight,
        windowWidth: 800
      });

      // Clean up temporary elements
      document.body.removeChild(tempContainer);

      if (!canvas || !canvas.toDataURL) {
        throw new Error('Failed to create canvas context');
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      if (!imgData || imgData === 'data:,') {
        throw new Error('Canvas is empty or failed to generate image data');
      }

      const pdf = new jsPDF({
        format: 'a4',
        unit: 'px'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        {/* <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div> */}
        <Preloader/>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <p className="text-red-600">{error || 'Order not found'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'none' }}>
        <div id="invoice-template">
          <InvoiceTemplate order={order} />
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600 mt-1">Placed on {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {order.status}
                </span>
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <Package className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Status</p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivery Date</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Pending'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Date</p>
                  <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CreditCard className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Method</p>
                  <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-6 flex items-center">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Size: {item.size} | Color: {item.color}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.material} | {item.threadCount ? `${item.threadCount} Thread Count` : `${item.fillPower} Fill Power`}
                              </p>
                            </div>
                            <p className="text-lg font-medium text-gray-900">
                              ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <button
                              onClick={() => handleBuyAgain(item.id)}
                              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                            >
                              Buy Again
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                <div className="flow-root">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Subtotal</dt>
                      <dd className="font-medium text-gray-900">
                        ₹{(order.subtotal || order.items.reduce((sum:number, item:number) => sum + (item.price * item.quantity), 0)).toFixed(2)}
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd className="font-medium text-gray-900">
                        {(order.shipping || 0) === 0 ? 'Free' : `₹${(order.shipping || 0).toFixed(2)}`}
                      </dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Tax</dt>
                      <dd className="font-medium text-gray-900">₹{(order.tax || 0).toFixed(2)}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-lg font-medium text-gray-900">Total</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₹{(order.total || (order.subtotal || order.items.reduce((sum:number, item:number) => sum + (item.price * item.quantity), 0)) + (order.shipping || 0) + (order.tax || 0)).toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Payment Information */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-sm font-medium ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    {order.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transaction ID</span>
                        <span className="text-sm font-medium text-gray-900">{order.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <address className="text-sm text-gray-600 not-italic">
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                    {order.shippingAddress.country}
                  </address>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.customerInfo.name}</p>
                    <p>{order.customerInfo.email}</p>
                    <p>{order.customerInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}