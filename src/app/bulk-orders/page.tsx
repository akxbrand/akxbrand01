'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minBulkQuantity: number;
  bulkPrice: number;
}

interface BulkOrderItem {
  productId: string;
  quantity: number;
}

export default function BulkOrders() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<BulkOrderItem[]>([]);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    deliveryAddress: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/bulk-products');
      if (!response.ok) {
        throw new Error('Failed to fetch bulk products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data.map(product => ({
        ...product,
        quantity: 0
      })) : []);
    } catch (error) {
      console.error('Error fetching bulk products:', error);
      setProducts([]);
    }
  };

  const handleProductSelect = (productId: string, quantity: number) => {
    if (quantity > 0) {
      setSelectedProducts(prev => {
        const existing = prev.find(item => item.productId === productId);
        if (existing) {
          return prev.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          );
        }
        return [...prev, { productId, quantity }];
      });
    } else {
      setSelectedProducts(prev =>
        prev.filter(item => item.productId !== productId)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    if (selectedProducts.length === 0) {
      setMessage('Please select at least one product');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bulk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          ...formData,
          items: selectedProducts
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Quote request submitted successfully!');
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phoneNumber: '',
          deliveryAddress: '',
          notes: ''
        });
        setSelectedProducts([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-gray-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-center"></div>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center relative z-10">
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">Wholesale & Corporate Orders</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Bulk Orders & Wholesale
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Premium bedding solutions for businesses, hotels, and large organizations
              </p>
            </div>
          </div>
        </section>

      

        {/* Quote Request Form */}
        <section className="py-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-3xl text-gray-900 font-bold mb-8 text-center">Request a Quote</h2>
              {message && (
                <div className={`p-4 mb-6 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <div>
                    <label className="block mb-2 text-md font-medium text-gray-700">Company Name (Optional) </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter your company name"
                      minLength={2}
                      maxLength={100}
                    />
                  </div> */}
                  <div>
                    <label className="block mb-2 text-md font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter Full name"
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-md font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter business email"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-md font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg transition-all duration-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter contact number"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 text-md font-medium text-gray-700">Delivery Address</label>
                  <textarea
                    required
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    className="w-full resize-none px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                    placeholder="Enter complete delivery address including street, city, state and PIN code"
                    rows={3}
                    minLength={10}
                    maxLength={500}
                  />
                </div>

                {/* Product Selection */}
                <div className="col-span-2 space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Select Products and Quantities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                      <div key={product.id} className="group relative bg-white rounded-2xl p-6 flex flex-col space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-100">
                        <div className="flex-1 space-y-3">
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{product.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="w-full space-y-4">
                          <div className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Min. Quantity:</span>
                              <span className="text-sm font-semibold text-gray-900">{product.minBulkQuantity}</span>
                            </div>
                            {/* <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Regular Price:</span>
                              <span className="text-sm font-semibold text-gray-900">₹{product.price}/unit</span>
                            </div> */}
                            {/* <div className="flex items-center justify-between text-blue-600">
                              <span className="text-sm font-medium">Bulk Price:</span>
                              <span className="text-sm font-bold">₹{product.bulkPrice}/unit</span>
                            </div> */}
                          </div>
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                              type="number"
                              min={product.minBulkQuantity || 0}
                              max="1000"
                              value={selectedProducts.find(item => item.productId === product.id)?.quantity || ''}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                if (quantity >= (product.minBulkQuantity || 0)) {
                                  handleProductSelect(product.id, quantity);
                                }
                              }}
                              className="block w-full px-4 py-2.5 text-gray-700 bg-white rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                              placeholder="Enter quantity"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block mb-2 text-md font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 resize-none block w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-20 hover:border-gray-400 shadow-sm hover:shadow"
                    placeholder="Any specific requirements or questions?"
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Quote Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
