'use client';

import React from 'react';
import Sidebar from './Sidebar';
import AdminProfileModal from './AdminProfileModal';
import NotificationDropdown from './NotificationDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              
              <div className="text-xl font-semibold text-gray-900">{title}</div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <AdminProfileModal />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </>
  );
}
