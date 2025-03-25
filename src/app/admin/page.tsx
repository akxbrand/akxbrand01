"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Package, 
  Flag, 
  BarChart3,
  Users,
  IndianRupee,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  recentRevenue: number;
  revenueGrowth: number;
  activeBanners: number;
  totalUsers: number;
  recentUsers: number;
  orderStatusCounts: Record<string, number>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }

        setDashboardData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <AdminLayout title='Admin Page'>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title='Admin Page'>
        <div className="p-4 text-red-500 bg-red-100 rounded-lg">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title='Admin Page'>
      <div className="p-6">
        <h1 className="text-2xl text-gray-900 font-bold mb-6">Dashboard Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.totalOrders || 0}</h2>
              </div>
              <ShoppingCart className="text-blue-500 h-8 w-8" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <h2 className="text-3xl text-gray-800 font-bold">
                  ₹{(dashboardData?.totalRevenue || 0).toLocaleString('en-IN')}
                </h2>
              </div>
              <IndianRupee className="text-green-500 h-8 w-8" />
            </div>
          </div>

          {/* Active Banners */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Banners</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.activeBanners || 0}</h2>
              </div>
              <Flag className="text-purple-500 h-8 w-8" />
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.totalUsers || 0}</h2>
              </div>
              <Users className="text-orange-500 h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Growth */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg text-gray-600 font-semibold mb-4">Revenue Growth</h3>
            <div className="flex text-gray-800 items-center space-x-4">
              <TrendingUp className={`h-8 w-8 ${(dashboardData?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-2xl font-bold">
                  {dashboardData?.revenueGrowth.toFixed(1)}%
                </p>
                <p className="text-gray-600 text-sm">vs last 30 days</p>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg text-gray-600 font-semibold mb-4">Recent Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Recent Revenue</p>
                <p className="text-2xl text-gray-800 font-bold">
                  ₹{(dashboardData?.recentRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">New Users</p>
                <p className="text-2xl text-gray-800 font-bold">{dashboardData?.recentUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg text-gray-600 font-semibold mb-4">Order Status Distribution</h3>
          <div className="grid grid-cols-1 text-gray-800 md:grid-cols-3 gap-4">
            {Object.entries(dashboardData?.orderStatusCounts || {}).map(([status, count]) => (
              <div key={status} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm capitalize">{status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
