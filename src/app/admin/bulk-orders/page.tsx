'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { PenSquare, Trash2 } from 'lucide-react';
type BulkOrderProduct = {
  id: string;
  name: string;
  description: string;
  minQuantity: number;
  pricePerUnit: number;
  regularPrice: number;
  createdAt: Date;
};

export default function BulkOrdersPage() {
  const [bulkProducts, setBulkProducts] = useState<BulkOrderProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBulkProducts = async () => {
      try {
        const response = await fetch('/api/admin/bulk-orders');
        if (!response.ok) throw new Error('Failed to fetch bulk order products');
        const data = await response.json();
        setBulkProducts(data);
      } catch (error) {
        toast.error('Failed to fetch bulk order products');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBulkProducts();
  }, []);
  const [editingProduct, setEditingProduct] = useState<BulkOrderProduct | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minQuantity: '',
    pricePerUnit: '',
    regularPrice: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.minQuantity) newErrors.minQuantity = 'Minimum quantity is required';
    else if (Number(formData.minQuantity) < 1) newErrors.minQuantity = 'Minimum quantity must be at least 1';
    if (!formData.regularPrice) newErrors.regularPrice = 'Regular price is required';
    else if (Number(formData.regularPrice) <= 0) newErrors.regularPrice = 'Regular price must be greater than 0';
    if (!formData.pricePerUnit) newErrors.pricePerUnit = 'Bulk price per unit is required';
    else if (Number(formData.pricePerUnit) <= 0) newErrors.pricePerUnit = 'Bulk price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      minQuantity: parseInt(formData.minQuantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      regularPrice: parseFloat(formData.regularPrice)
    };

    try {
      const response = await fetch(editingProduct ? `/api/admin/bulk-orders/${editingProduct.id}` : '/api/admin/bulk-orders', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} bulk order product`);

      const result = await response.json();
      if (editingProduct) {
        setBulkProducts(prev => prev.map(p => p.id === editingProduct.id ? result : p));
        toast.success('Bulk order product updated successfully');
        setEditingProduct(null);
      } else {
        setBulkProducts(prev => [...prev, result]);
        toast.success('Bulk order product added successfully');
      }

      setFormData({ name: '', description: '', minQuantity: '', pricePerUnit: '', regularPrice: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      const response = await fetch(`/api/admin/bulk-orders/${deleteProductId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete bulk order product');

      setBulkProducts(prev => prev.filter(p => p.id !== deleteProductId));
      toast.success('Bulk order product deleted successfully');
      setDeleteProductId(null);
    } catch (error) {
      toast.error('Failed to delete bulk order product');
      console.error('Error:', error);
    }
  };

  const startEdit = (product: BulkOrderProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      minQuantity: product.minQuantity.toString(),
      pricePerUnit: product.pricePerUnit.toString(),
      regularPrice: product.regularPrice.toString()
    });
  };

  return (
    <AdminLayout title='Bulk Order Page'>
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Bulk Orders Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage bulk order products and their minimum quantities</p>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Edit Bulk Order Product' : 'Add Bulk Order Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out hover:border-gray-400 text-gray-900 text-base"
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700 mb-2">Minimum Quantity</label>
                    <input
                      type="number"
                      id="minQuantity"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out hover:border-gray-400 text-gray-900 text-base"
                      placeholder="Enter minimum quantity"
                      min="1"
                    />
                    {errors.minQuantity && <p className="mt-2 text-sm text-red-600">{errors.minQuantity}</p>}
                  </div>

                  <div>
                    <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-700 mb-2">Regular Price (₹/unit)</label>
                    <input
                      type="number"
                      id="regularPrice"
                      value={formData.regularPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, regularPrice: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out hover:border-gray-400 text-gray-900 text-base"
                      placeholder="Enter regular price per unit"
                      step="0.01"
                      min="0"
                    />
                    {errors.regularPrice && <p className="mt-2 text-sm text-red-600">{errors.regularPrice}</p>}
                  </div>

                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-2">Bulk Price (₹/unit)</label>
                    <input
                      type="number"
                      id="pricePerUnit"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out hover:border-gray-400 text-gray-900 text-base"
                      placeholder="Enter bulk price per unit"
                      step="0.01"
                      min="0"
                    />
                    {errors.pricePerUnit && <p className="mt-2 text-sm text-red-600">{errors.pricePerUnit}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition duration-200 ease-in-out hover:border-gray-400 text-gray-900 text-base resize-none"
                      placeholder="Enter product description"
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: '', description: '', minQuantity: '', pricePerUnit: '', regularPrice: '' });
                      }}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bulk Order Products</h2>
            
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading bulk order products...
                      </td>
                    </tr>
                  ) : bulkProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No bulk order products found
                      </td>
                    </tr>
                  ) : (
                    bulkProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={product.description}>
                          {product.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.minQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{product.pricePerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <PenSquare className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                setDeleteProductId(product.id);
                                setTimeout(handleDelete, 0);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    )))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}