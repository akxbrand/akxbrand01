"use client";

import React, { useState, useEffect } from 'react';
import Toast from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Calendar, Tag, Percent } from 'lucide-react';
import AddCouponModal from '@/components/admin/AddCouponModal';
import EditCouponModal from '@/components/admin/EditCouponModal';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  isActive: boolean;
  description?: string;
  categoryIds?: string[];
  productIds?: string[];
}

export default function CouponsPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      const data = await response.json();
      if (response.ok) {
        setCoupons(data.coupons);
      } else {
        throw new Error(data.error || 'Failed to fetch coupons');
      }
    } catch (error) {
      setToastMessage('Error fetching coupons');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this coupon?')) {
        const response = await fetch(`/api/admin/coupons/${couponId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        
        if (response.ok) {
          setCoupons(coupons.filter(coupon => coupon.id !== couponId));
          setToastMessage('Coupon deleted successfully');
          setToastType('success');
        } else {
          throw new Error(data.error || 'Failed to delete coupon');
        }
      }
    } catch (error) {
      setToastMessage('Error deleting coupon');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const handleAddCoupon = async (newCoupon: Omit<Coupon, 'id' | 'usageCount'>) => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCoupon),
      });
      const data = await response.json();

      if (response.ok) {
        setCoupons([...coupons, data.coupon]);
        setIsAddModalOpen(false);
        setToastMessage('Coupon added successfully');
        setToastType('success');
      } else {
        throw new Error(data.error || 'Failed to add coupon');
      }
    } catch (error) {
      setToastMessage('Error adding coupon');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const handleEditCoupon = async (updatedCoupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${updatedCoupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCoupon),
      });
      const data = await response.json();

      if (response.ok) {
        setCoupons(coupons.map(coupon => 
          coupon.id === updatedCoupon.id ? data.coupon : coupon
        ));
        setIsEditModalOpen(false);
        setSelectedCoupon(null);
        setToastMessage('Coupon updated successfully');
        setToastType('success');
      } else {
        throw new Error(data.error || 'Failed to update coupon');
      }
    } catch (error) {
      setToastMessage('Error updating coupon');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  return (
    <AdminLayout title="Coupons Page">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-700">Manage Coupons</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Coupon
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No coupons found. Click "Add New Coupon" to create one.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Percent className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`}
                          {coupon.maxDiscount ? ` (Max: ₹${coupon.maxDiscount})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">₹{coupon.minPurchase || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'N/A'} - 
                          {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{coupon.usageLimit ? `0/${coupon.usageLimit}` : 'Unlimited'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddCouponModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCoupon}
      />

      <EditCouponModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCoupon(null);
        }}
        coupon={selectedCoupon}
        onEdit={handleEditCoupon}
      />

      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </AdminLayout>
  );
}
