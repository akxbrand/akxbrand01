"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Preloader from '@/components/ui/preloader';
import Toast from '@/components/ui/Toast';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Plus,
  Trash2,
  X,
  Edit
} from "lucide-react";
import { isValidEmail } from "@/utils/validation";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState("/images/default-avatar.jpg");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/address?id=${addressId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
  
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      setToastMessage('Address deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting address:', error);
      setToastMessage('Failed to delete address');
      setToastType('error');
      setShowToast(true);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Clear all items from localStorage
      localStorage.clear();
      // Clear specific session-related items if needed
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      await signOut({
        redirect: true,
        callbackUrl: '/login'
      });
    } catch (error) {
      // console.error('Logout failed:', error);
      // Show error notification to user
      setToastMessage('Failed to logout. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [originalSettings, setOriginalSettings] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phoneNumber: "",
  });
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/user/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
          setError('');
        } else {
          setOrders([]);
          setError('No orders found');
        }
      } catch (error) {
        setOrders([]);
        setError('Failed to load orders');
        setToastMessage('Failed to load orders');
        setToastType('error');
        setShowToast(true);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        const userData = await response.json();
        setProfileSettings(userData);
        setOriginalSettings(userData);
        if (userData.image) {
          setProfileImage(userData.image);
        }
        setIsAuthenticated(true);
      } catch (error) {
        // console.error('Error fetching user profile:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/user/address');
        if (!response.ok) {
          throw new Error('Failed to fetch addresses');
        }
        const addressData = await response.json();
        setAddresses(addressData);
      } catch (error) {
        // console.error('Error fetching addresses:', error);
        setToastMessage('Failed to load addresses');
        setToastType('error');
        setShowToast(true);
      }
    };

    fetchUserProfile();
    fetchAddresses();
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [router, activeTab]);

  

  if (isLoading) {
    return <Preloader />;
  }

  if (!isAuthenticated) {
    return null; // This prevents flash of content before redirect
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const body = {
        ...(editingAddress && { id: editingAddress.id }),
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        street: newAddress.addressLine1,
        apartment: newAddress.addressLine2,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode
      };

      const response = await fetch('/api/user/address', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingAddress ? 'update' : 'add'} address`);
      }

      const savedAddress = await response.json();
      
      if (editingAddress) {
        setAddresses(addresses.map(addr => addr.id === savedAddress.id ? savedAddress : addr));
      } else {
        setAddresses([...addresses, savedAddress]);
      }
      
      setIsAddressModalOpen(false);
      setToastMessage(`Address ${editingAddress ? 'updated' : 'added'} successfully`);
      setToastType('success');
      setShowToast(true);
      setEditingAddress(null);

      // Reset form
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
      });
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : `Failed to ${editingAddress ? 'update' : 'add'} address`);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
      setNewAddress(prev => ({ ...prev, [name]: sanitizedValue }));
      if (sanitizedValue.length === 6) {
        setIsLoadingPincode(true);
        setPincodeError('');
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${sanitizedValue}`);
          const data = await response.json();

          if (data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setNewAddress(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State,
            }));
          } else {
            setPincodeError('Invalid PIN code. Please enter city and state manually.');
            setNewAddress(prev => ({
              ...prev,
              city: '',
              state: '',
            }));
          }
        } catch (error) {
          setPincodeError('Error fetching address details. Please enter city and state manually.');
          setNewAddress(prev => ({
            ...prev,
            city: '',
            state: '',
          }));
        } finally {
          setIsLoadingPincode(false);
        }
      }
    } else {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    }
  };

 

 
  const fetchAddressDetails = async (pincode: string) => {
    if (pincode.length === 6) {
      setIsLoadingPincode(true);
      setPincodeError("");
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
        const data = await response.json();

        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setNewAddress((prev) => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
          }));
        } else {
          setPincodeError(
            "Invalid PIN code. Please enter city and state manually."
          );
          setNewAddress((prev) => ({
            ...prev,
            city: "",
            state: "",
          }));
        }
      } catch (error) {
        setPincodeError(
          "Error fetching address details. Please enter city and state manually."
        );
        setNewAddress((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      } finally {
        setIsLoadingPincode(false);
      }
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setNewAddress((prev) => ({ ...prev, pincode: value }));
    if (value.length === 6) {
      fetchAddressDetails(value);
    }
  };

  // Handle profile input changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let error = "";

    // Validate email
    if (name === "email" && value && !isValidEmail(value)) {
      error = "Please enter a valid email address";
    }

    // Validate phone number
    if (name === "phoneNumber" && value) {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length !== 10) {
        error = "Please enter a valid phone number";
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setProfileSettings((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    const hasChanges = Object.keys(profileSettings).some(
      (key) =>
        profileSettings[key as keyof typeof profileSettings] !==
        originalSettings[key as keyof typeof originalSettings]
    );

    setIsProfileChanged(hasChanges);
    setIsUnsavedChanges(hasChanges);
};

const handleProfileSave = async () => {
  // Validate all fields before saving
  const errors = {
    email: !isValidEmail(profileSettings.email) ? "Please enter a valid email address" : "",
    phoneNumber: profileSettings.phoneNumber.length !== 10 ? "Please enter a valid phone number" : "",
  };

  setValidationErrors(errors);

  if (Object.values(errors).some((error) => error)) {
    return;
  }

  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileSettings),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const updatedUser = await response.json();
    setOriginalSettings(updatedUser);
    setProfileSettings(updatedUser);
    setIsProfileChanged(false);
    setIsUnsavedChanges(false);
    
    setToastMessage('Profile updated successfully');
    setToastType('success');
    setShowToast(true);
  } catch (error) {
    // console.error("Error saving profile:", error);
    setToastMessage('Failed to update profile');
    setToastType('error');
    setShowToast(true);
  }
};

// Handle profile save
const handleProfileSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await handleProfileSave();
};

  const menuItems = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your profile, orders, and preferences
            </p>
          </div>

          {/* Mobile Profile Summary - Only visible on mobile */}
          <div className="md:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src="/images/user.png"
                      alt="Profile"
                      width={60}
                      height={60}
                      className="object-cover w-full h-full  "
                    />
                  </div>
                  {/* <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3 text-gray-600" />
                  </button> */}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {profileSettings.name || 'Your Name'}
                  </h2>
                  <p className="text-sm text-gray-600">{profileSettings.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation - Only visible on mobile */}
          <div className="md:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 gap-1 p-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-sm ${activeTab === item.id
                          ? "bg-gray-100 text-gray-700"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Profile Summary */}
                {/* <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4"> */}
                {/* <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={profileImage}
                          alt="Profile"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                    </div> */}
                {/* <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        John Doe
                      </h2>
                      <p className="text-sm text-gray-600">
                        john.doe@example.com
                      </p>
                    </div> */}
                {/* </div>
                </div> */}

                {/* Desktop Navigation Menu */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <User size={20} />
                    <span>Profile Information</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "orders" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "addresses" ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <MapPin size={20} />
                    <span>Saved Addresses</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                  <div className="space-y-6">
                    
                    {/* Profile Form */}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileSettings.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                          placeholder="Enter your name"
                          aria-label="Full Name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileSettings.email}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400 ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}"
                          placeholder="Enter your email"
                          aria-label="Email Address"
                          aria-invalid={!!validationErrors.email}
                          aria-describedby={validationErrors.email ? 'email-error' : undefined}
                        />
                        {validationErrors.email && (
                          <p id="email-error" className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profileSettings.phoneNumber}
                          onChange={handleProfileChange}
                          maxLength={10}
                          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400 ${validationErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''}"
                          placeholder="Enter your phone number"
                          aria-label="Phone Number"
                          aria-invalid={!!validationErrors.phoneNumber}
                          aria-describedby={validationErrors.phoneNumber ? 'phone-error' : undefined}
                        />
                        {validationErrors.phoneNumber && (
                          <p id="phone-error" className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                          disabled={!isProfileChanged}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : error ? (
                        <div className="text-center py-8">
                          <p className="text-red-600">{error}</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-600 mb-6">Start shopping to create your first order</p>
                          <button
                            onClick={() => router.push('/shop')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Browse Products
                          </button>
                        </div>
                      ) : (
                        orders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                                <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4">
                                  <div className="flex-shrink-0 w-16 h-16">
                                    <img
                                      src={item.image || '/images/placeholder.jpg'}
                                      alt={item.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    ₹{item.price.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-between items-center pt-4 border-t">
                              <div className="text-sm font-medium text-gray-900">
                                Total: ₹{order.total.toFixed(2)}
                              </div>
                              <button
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={15} className="mr-2"/>
                      Add New Address
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-30 rounded-lg">
                      <p className="text-gray-600">No addresses saved yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address: any) => (
                        <div key={address.id} className="p-4 border rounded-lg shadow-sm relative">
                            {address.isDefault && (
                              <span className="absolute top-2 top-24 right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-gray-700 font-md">{address.label}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setNewAddress({
                                    fullName: address.label,
                                    phone: address.phone,
                                    addressLine1: address.street,
                                    addressLine2: address.apartment || '',
                                    city: address.city,
                                    state: address.state,
                                    pincode: address.pincode,
                                  });
                                  setIsAddressModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                              {!address.isDefault && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch('/api/user/address', {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          ...address,
                                          isDefault: true
                                        }),
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error('Failed to update address');
                                      }
                                      
                                      const updatedAddress = await response.json();
                                      setAddresses(addresses.map(addr => ({
                                        ...addr,
                                        isDefault: addr.id === address.id
                                      })));
                                      
                                      setToastMessage('Address set as default');
                                      setToastType('success');
                                      setShowToast(true);
                                    } catch (error) {
                                      setToastMessage('Failed to update address');
                                      setToastType('error');
                                      setShowToast(true);
                                    }
                                  }}
                                  className="text-gray-600 hover:text-gray-800 text-sm "
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">{address.street}</p>
                          {/* {address.apartment && (
                            <p className="text-gray-600">{address.apartment}</p>
                          )} */}
                          <p className="text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Logout Button - Only visible on mobile */}
      <div className="md:hidden mt-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm text-red-600 bg-white hover:bg-red-50 rounded-lg shadow-sm">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

     
      <Toast
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsAddressModalOpen(false)}></div>
            <div className="relative bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Address</h2>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={newAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={newAddress.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={newAddress.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State *</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={newAddress.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">PIN Code *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={newAddress.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter your PIN code"
                    className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-700 rounded-md"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
