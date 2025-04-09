"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ShoppingCart, 
  Flag, 
  Users,
  IndianRupee,
  TrendingUp,
  Megaphone,
  Package,
  Ticket,
  Video
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardData {
  totalOrders: number;
  totalRevenue: number;
  recentRevenue: number;
  revenueGrowth: number;
  activeBanners: number;
  totalUsers: number;
  recentUsers: number;
  orderStatusCounts: Record<string, number>;
  activeAnnouncements: number;
  activeProducts: number;
  activeCoupons: number;
  activeFeatureVideos: number;
  topProducts: Array<{
    name: string;
    orderCount: number;
  }>;
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

          {/* Active Announcements */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Announcements</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.activeAnnouncements || 0}</h2>
              </div>
              <Megaphone className="text-pink-500 h-8 w-8" />
            </div>
          </div>

          {/* Active Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Products</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.activeProducts || 0}</h2>
              </div>
              <Package className="text-indigo-500 h-8 w-8" />
            </div>
          </div>

          {/* Active Coupons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Coupons</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.activeCoupons || 0}</h2>
              </div>
              <Ticket className="text-yellow-500 h-8 w-8" />
            </div>
          </div>

          {/* Feature Videos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Feature Videos</p>
                <h2 className="text-3xl text-gray-800 font-bold">{dashboardData?.activeFeatureVideos || 0}</h2>
              </div>
              <Video className="text-cyan-500 h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg text-gray-600 font-semibold mb-4">Revenue Growth</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" className="text-gray-700">
                <AreaChart
                  data={[{
                    name: 'Previous',
                    value: (dashboardData?.recentRevenue || 0) / (1 + (dashboardData?.revenueGrowth || 0) / 100)
                  }, {
                    name: 'Current',
                    value: dashboardData?.recentRevenue || 0
                  }]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ddd' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22C55E"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                  
                {/* </BarChart> */}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex text-gray-800 items-center space-x-4 mt-4">
              <TrendingUp className={`h-8 w-8 ${(dashboardData?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-2xl font-bold">
                  {dashboardData?.revenueGrowth.toFixed(1)}%
                </p>
                <p className="text-gray-600 text-sm">vs last 30 days</p>
              </div>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg text-gray-600 font-semibold mb-4">User Growth</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%" className="text-gray-700">
                <LineChart
                  data={[{
                    name: 'Previous',
                    value: dashboardData?.totalUsers - (dashboardData?.recentUsers || 0) || 0
                  }, {
                    name: 'Current',
                    value: dashboardData?.totalUsers || 0
                  }]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ddd' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ stroke: '#F59E0B', strokeWidth: 2, r: 4, fill: '#fff' }}
                    activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1500}
                  />
                  </LineChart>
            
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl text-gray-800 font-bold">{dashboardData?.totalUsers || 0}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">New Users</p>
                <p className="text-2xl text-gray-800 font-bold">{dashboardData?.recentUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg text-gray-600 font-semibold mb-4">Order Status Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" className="text-gray-700">
              <BarChart
                data={Object.entries(dashboardData?.orderStatusCounts || {}).map(([status, count]) => ({
                  status,
                  count
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="status" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ddd' }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorOrders)"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 text-gray-800 md:grid-cols-3 gap-4 mt-4">
            {Object.entries(dashboardData?.orderStatusCounts || {}).map(([status, count]) => (
              <div key={status} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm capitalize">{status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>
         {/* Most Ordered Products Donut Chart */}
         <div className="bg-white p-6 rounded-lg shadow-md mb-8 mt-8">
            <h3 className="text-lg text-gray-600 font-semibold mb-4">Most Ordered Products</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" className="text-gray-700">
                <PieChart>
                  <Pie
                    data={(dashboardData?.topProducts || []).map(product => ({
                      name: product.name,
                      value: product.orderCount
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(dashboardData?.topProducts || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={[
                          '#4F46E5',
                          '#22C55E',
                          '#F59E0B',
                          '#EC4899',
                          '#06B6D4'
                        ][index % 5]}
                      />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg font-semibold text-gray-700"
                  >
                    {"Products"}
                  </text>
                  {/* <text
                    x="50%"
                    y="60%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm text-gray-500"
                  >
                    {dashboardData?.topProducts?.[0]?.orderCount || 0} orders
                  </text> */}
                  <Tooltip
                    formatter={(value, name) => [`${value} orders`, name]}
                    contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ddd' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap4 mt-4">
              {dashboardData?.topProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${[
                    'bg-indigo-600',
                    'bg-green-500',
                    'bg-amber-500',
                    'bg-pink-500',
                    'bg-cyan-500'
                  ][index % 5]}`}></div>
                  <p className="text-sm text-gray-600 truncate">{product.name}</p>
                </div>
              ))}
            </div>
          </div>
      </div>
    </AdminLayout>
  );
}
