'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FeatureVideoManager from '@/components/admin/FeatureVideoManager';

export default function FeatureVideosPage() {
  return (
    <AdminLayout title="Feature Videos">
      <div className="p-6">
        <FeatureVideoManager />
      </div>
    </AdminLayout>
  );
}