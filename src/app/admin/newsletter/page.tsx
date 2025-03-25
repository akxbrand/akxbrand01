"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Toast from '@/components/ui/Toast';
import { FileSpreadsheet, Mail, Search, Trash2, X } from 'lucide-react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  subscribedAt: Date;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    const filterSubscribers = () => {
      if (!searchQuery.trim()) {
        setFilteredSubscribers(subscribers);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = subscribers.filter(subscriber =>
        subscriber.email.toLowerCase().includes(query)
      );
      setFilteredSubscribers(filtered);
    };

    const debounceTimeout = setTimeout(filterSubscribers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, subscribers]);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setFilteredSubscribers(data.subscribers);
      } else {
        throw new Error(data.error || 'Failed to fetch subscribers');
      }
    } catch (error: any) {
    //   console.error('Error fetching subscribers:', error);
      showToastMessage(error.message || 'Error fetching subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriberId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subscriberId, status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubscribers();
        showToastMessage(`Subscriber status updated to ${newStatus}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
    //   console.error('Error updating subscriber status:', error);
      showToastMessage(error.message || 'Error updating subscriber status', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleExportSubscribers = () => {
    const csvContent = 'Email,Status,Subscribed Date\n' +
      subscribers.map(subscriber => 
        `${subscriber.email},${subscriber.status},${formatDate(subscriber.subscribedAt)}`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'newsletter-subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        const response = await fetch('/api/admin/newsletter', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: subscriberId })
        });

        const data = await response.json();
        if (data.success) {
          await fetchSubscribers();
          showToastMessage('Subscriber deleted successfully');
        } else {
          throw new Error(data.error);
        }
      } catch (error: any) {
        // console.error('Error deleting subscriber:', error);
        showToastMessage(error.message || 'Error deleting subscriber', 'error');
      }
    }
  };

  return (
    <AdminLayout title="Newsletter Page">
      <div className="p-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-xl font-semibold text-gray-900">Newsletter Subscribers</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Manage your newsletter subscribers and their subscription status.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-4">
                <button
                  onClick={handleExportSubscribers}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileSpreadsheet className="h-5 w-5 mr-2" />
                  Export CSV
                </button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flow-root">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Loading subscribers...</div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No subscribers found</div>
              ) : (
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            Email
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Subscribed Date
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSubscribers.map((subscriber) => (
                          <tr key={subscriber.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              <div className="flex items-center">
                                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                {subscriber.email}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(subscriber.subscribedAt)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <select
                                value={subscriber.status}
                                onChange={(e) => handleStatusChange(subscriber.id, e.target.value)}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${subscriber.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-0">
                              <button
                                onClick={() => handleDeleteSubscriber(subscriber.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={true}
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </AdminLayout>
  );
}