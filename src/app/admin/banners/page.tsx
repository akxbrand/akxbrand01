"use client";

import React, { useState, useEffect } from 'react';
import Toast from '@/components/ui/Toast';
import AdminLayout from '@/components/admin/AdminLayout';
import AddBannerModal from '@/components/admin/AddBannerModal';
import EditBannerModal from '@/components/admin/EditBannerModal';
import { Plus, PenSquare, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function BannersPage() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      const data = await response.json();
      if (data.success) {
        setBanners(data.banners);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleAddBanner = async (bannerData: any) => {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchBanners();
        setIsAddModalOpen(false);
        showToastMessage('Banner added successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error adding banner', 'error');
    }
  };

  const handleEditBanner = async (bannerData: any) => {
    try {
      const response = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchBanners();
        setIsEditModalOpen(false);
        setSelectedBanner(null);
        showToastMessage('Banner updated successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error updating banner', 'error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this banner?')) {
        const response = await fetch('/api/banners', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: bannerId })
        });

        const data = await response.json();
        if (data.success) {
          await fetchBanners();
          showToastMessage('Banner deleted successfully');
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error deleting banner', 'error');
    }
  };

  return (
    <AdminLayout title="Banner Page">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-gray-800 font-semibold"></h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center bg-blue-500 gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 text-white" /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No banners found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-700 text-lg mb-2">{banner.title}</h3>
                  {banner.description && (
                    <p className="text-gray-600 text-sm mb-2">{banner.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBanner(banner);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <PenSquare className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddModalOpen && (
          <AddBannerModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddBanner}
          />
        )}

        {isEditModalOpen && selectedBanner && (
          <EditBannerModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBanner(null);
            }}
            onUpdate={handleEditBanner}
            banner={selectedBanner}
          />
        )}

        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            show={showToast}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
