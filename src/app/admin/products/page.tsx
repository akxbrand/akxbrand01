"use client";

import React, { useState, useEffect } from 'react';
import Toast from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import AddProductModal from '@/components/admin/AddProductModal';
import EditProductModal from '@/components/admin/EditProductModal';
import ProductDetailModal from '@/components/admin/ProductDetailModal';
import { Plus, PenSquare, Trash2, X } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  nickname?: string;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  subCategoryId?: string;
  subCategory?: {
    id: string;
    name: string;
  };
  oldPrice?: number;
  price: number;
  stock: number;
  status: string;
  isLimitedTimeDeal: boolean;
  dealStartTime?: string;
  dealEndTime?: string;
  dealQuantityLimit?: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  weeklySales: number;
  sizes: ProductSize[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ProductsPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products?page=${page}&search=${searchQuery}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      // console.error('Error fetching products:', error);
      setToastMessage('Failed to fetch products');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    // Validate required fields
    const requiredFields = {
      name: 'Product name',
      categoryId: 'Category',
      images: 'Product images',
      sizes: 'Product sizes',
      price: 'Product price'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!productData[field] || 
          (Array.isArray(productData[field]) && productData[field].length === 0) ||
          (field === 'price' && (isNaN(productData[field]) || productData[field] <= 0))) {
        setToastMessage(`${label} is required`);
        setToastType('error');
        setShowToast(true);
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productData,
          images: productData.images || []
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setProducts(prevProducts => [{
        ...data,
        category: data.category?.name || 'Uncategorized',
        images: data.images || []
      }, ...prevProducts]);
      setIsAddModalOpen(false);
      setToastMessage('Product added successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding product:', error);
      setToastMessage('Failed to add product');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditProduct = async (productId: string, updatedData: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, ...data, category: data.category?.name || 'Uncategorized' } : product
        )
      );
      setIsEditModalOpen(false);
      setToastMessage('Product updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating product:', error);
      setToastMessage('Failed to update product');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      setToastMessage('Product deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting product:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to delete product');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <AdminLayout title='Product Page'>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-gray-800 font-semibold">Products Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-gray-700 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nick Name</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-gray-400 text-center">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 text-gray-400 py-4 text-center">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Only open details modal if not clicking action buttons
                      if (!(e.target as HTMLElement).closest('button')) {
                        setSelectedProduct(product);
                        setIsDetailsModalOpen(true);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images[0] && (
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category.name}</div>
                      {product.subCategory && (
                        <div className="text-sm text-gray-500">{product.subCategory.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{(product.price || 0).toLocaleString()}</div>
                      {/* {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">₹{(product.oldPrice || 0).toLocaleString()}</div>
                      )} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <AddProductModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddProduct}
          />
        )}

        {isEditModalOpen && selectedProduct && (
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={(updatedData) => handleEditProduct(selectedProduct.id, updatedData)}
            product={selectedProduct}
          />
        )}

        {isDetailsModalOpen && selectedProduct && (
          <ProductDetailModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            product={selectedProduct}
          />
        )}

        {/* Toast Notification */}
        {showToast && (
          <Toast
            show={showToast}
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
