"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import CustomerStatusBadge from '@/components/admin/CustomerStatusBadge';
import { Customer, CustomerStatus } from '@/types/customer';
import { Eye, Mail, Phone, ExternalLink, Trash2 } from 'lucide-react';
import Toast from '@/components/ui/Toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filterCustomers = () => {
      if (!searchQuery.trim()) {
        setFilteredCustomers(customers);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.includes(query))
      );
      setFilteredCustomers(filtered);
    };

    const debounceTimeout = setTimeout(filterCustomers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
        setFilteredCustomers(data.customers);
      } else {
        throw new Error(data.error || 'Failed to fetch customers');
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setToastMessage(error.message || 'Error fetching customers');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (customerId: string, newStatus: CustomerStatus, reason?: string) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: customerId, status: newStatus, reason }),
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(prevCustomers =>
          prevCustomers.map(customer =>
            customer.id === customerId
              ? { ...customer, status: newStatus }
              : customer
          )
        );
        setToastMessage(`Customer status updated to ${newStatus}`);
        setToastType('success');
      } else {
        throw new Error(data.error || 'Failed to update customer status');
      }
    } catch (error: any) {
      console.error('Error updating customer status:', error);
      setToastMessage(error.message || 'Error updating customer status');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId));
        setToastMessage('Customer deleted successfully');
        setToastType('success');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      setToastMessage(error.message || 'Error deleting customer');
      setToastType('error');
    } finally {
      setShowToast(true);
    }
  };

  return (
    <AdminLayout title="Customers Page">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Manage Customers</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all customers including their name, email, orders, and status.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flow-root">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No customers found</div>
            ) : (
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Customer
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Contact
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Orders
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Total Spent
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xl font-medium text-gray-600">
                                    {customer.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                <div className="text-gray-500">
                                  Joined {new Date(customer.joinedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {customer.totalOrders} orders
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            ₹{customer.totalSpent.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <CustomerStatusBadge 
                              status={customer.status} 
                              onStatusChange={(newStatus, reason) => handleStatusChange(customer.id, newStatus, reason)}
                            />
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-center text-sm font-medium sm:pr-0">
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </AdminLayout>
  );
}
