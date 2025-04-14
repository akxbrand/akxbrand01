'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminProfileModal from './AdminProfileModal';
import NotificationDropdown from './NotificationDropdown';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-50 pl-0 md:pl-64 relative w-full overflow-x-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 w-full">
          <div className="flex justify-between items-center max-w-full">
            <div className="flex items-center space-x-3 overflow-hidden">
              <button
                type="button"
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setIsSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
              <div className="text-xl font-semibold text-gray-900 truncate">{title}</div>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <NotificationDropdown />
              <AdminProfileModal />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6 overflow-x-auto w-full">
          {children}
        </main>
      </div>
    </>
  );
}
