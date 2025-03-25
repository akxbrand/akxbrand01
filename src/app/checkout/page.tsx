'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import { loadScript, initializeRazorpay } from '@/utils/razorpay';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { formatCurrency } from '@/utils/currency';
import Toast from '@/components/ui/Toast';

interface Address {
  id: string;
  label: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal } = useCart();
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [newAddress, setNewAddress] = useState<Address>({
    id: '',
    label: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<Partial<Address>>({});
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    maxDiscount?: number;
  } | null>(null);


  const validateCoupon = async () => {
    if (!couponCode) {
      showToastMessage('Please enter a coupon code', 'error');
      return;
    }
  
    setIsValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: cartTotal
        }),
      });

      // After successful payment and order creation
      if (appliedCoupon) {
        await fetch('/api/coupons/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCode: appliedCoupon.code,
            orderId: data.orderId
          }),
        });
      }
  
      const data = await response.json();
      if (response.ok) {
        setCouponDiscount(data.discount);
        setAppliedCoupon(data.couponDetails);
        showToastMessage('Coupon applied successfully', 'success');
      } else {
        setCouponDiscount(0);
        setAppliedCoupon(null);
        showToastMessage(data.error || 'Invalid coupon code', 'error');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      showToastMessage('Failed to validate coupon', 'error');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };
  
  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
    showToastMessage('Coupon removed', 'success');
  };
  
  {/* Add this in the order summary section */}
  <div className="mt-4 p-4 border rounded-lg">
    <h3 className="text-lg font-medium mb-2">Apply Coupon</h3>
    <div className="flex space-x-2">
      <input
        type="text"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        placeholder="Enter coupon code"
        className="flex-1 p-2 border rounded-md"
        disabled={isValidatingCoupon || appliedCoupon !== null}
      />
      {appliedCoupon ? (
        <button
          onClick={removeCoupon}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          disabled={isValidatingCoupon}
        >
          Remove
        </button>
      ) : (
        <button
          onClick={validateCoupon}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isValidatingCoupon || !couponCode}
        >
          {isValidatingCoupon ? 'Validating...' : 'Apply'}
        </button>
      )}
    </div>
    {appliedCoupon && (
      <div className="mt-2 text-sm text-green-600">
        Coupon applied: {appliedCoupon.discountType === 'percentage' 
          ? `${appliedCoupon.discountAmount}% off` 
          : `₹${appliedCoupon.discountAmount} off`}
        {appliedCoupon.maxDiscount && ` (Max: ₹${appliedCoupon.maxDiscount})`}
      </div>
    )}
  </div>
  
  {/* Update the total section */}
  <div className="mt-4 space-y-2">
    <div className="flex justify-between text-sm">
      <span>Subtotal</span>
      <span>{formatCurrency(cartTotal)}</span>
    </div>
    {couponDiscount > 0 && (
      <div className="flex justify-between text-sm text-green-600">
        <span>Coupon Discount</span>
        <span>-{formatCurrency(couponDiscount)}</span>
      </div>
    )}
    <div className="flex justify-between font-medium text-lg border-t pt-2">
      <span>Total</span>
      <span>{formatCurrency(cartTotal - couponDiscount)}</span>
    </div>
  </div>
  
  


  useEffect(() => {
    fetchAddresses();
  }, []);
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/address');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
      
      // Set the default address as selected
      const defaultAddress = data.find((addr: Address) => addr.isDefault);
      if (defaultAddress) setSelectedAddressId(defaultAddress.id);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      showToastMessage('Please select a delivery address', 'error');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');
    setPaymentError('');

    try {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      const orderData = {
        items: cartItems,
        shippingAddress: selectedAddress,
        couponDiscount: couponDiscount
      };

      const { orderId, amount, currency, dbOrderId } = await createRazorpayOrder(orderData);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Himanshi Ecom',
        description: 'Purchase Payment',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const verificationResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: dbOrderId
              })
            });

            if (verificationResponse.ok) {
              router.push(`/orders/${dbOrderId}?success=true`);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: selectedAddress?.label,
          contact: selectedAddress?.phone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpayInstance = await initializeRazorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
      showToastMessage('Payment initialization failed', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const endpoint = editingAddressId ? `/api/address/${editingAddressId}` : '/api/user/address';
      const method = editingAddressId ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: newAddress.label || 'Home', // Provide a default label if empty
          fullName: newAddress.label, // Use label as fullName for compatibility
          phone: newAddress.phone,
          street: newAddress.street,
          apartment: newAddress.apartment,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          isDefault: newAddress.isDefault
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save address');
      }
      
      const savedAddress = await response.json();
      
      if (editingAddressId) {
        setAddresses(addresses.map(addr =>
          addr.id === editingAddressId ? savedAddress : addr
        ));
        setEditingAddressId(null);
      } else {
        setAddresses([...addresses, savedAddress]);
      }

      setShowAddForm(false);
      setNewAddress({
        id: '',
        label: '',
        phone: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    } catch (error: any) {
      console.error('Error saving address:', error);
      showToastMessage(error.message || 'Failed to save address. Please try again.', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/address/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete address');

      setAddresses(addresses.filter(addr => addr.id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToastMessage('Failed to delete address. Please try again.', 'error');
    }
  };

  const handleMakeDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/address/${addressId}/default`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to update default address');

      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
    } catch (error) {
      console.error('Error updating default address:', error);
      alert('Failed to update default address. Please try again.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(address);
    setEditingAddressId(address.id);
    setShowAddForm(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToastMessage('Please select a delivery address', 'error');
      return;
    }

    if (cartTotal <= 0) {
      showToastMessage('Your cart is empty', 'error');
      return;
    }

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size
          })),
          shippingAddress: addresses.find(addr => addr.id === selectedAddressId),
          couponDiscount: couponDiscount || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Himanshi Ecom',
        description: 'Payment for your order',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();
            if (verifyData.showSuccessModal) {
              showToastMessage('Payment successful!', 'success');
              router.push('/orders');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            showToastMessage(error.message || 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: session?.user?.name || selectedAddress?.label || '',
          email: session?.user?.email || ''
        },
        theme: {
          color: '#F37254'
        }
      };

      const razorpay = await initializeRazorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Order creation error:', error);
      showToastMessage(error.message || 'Failed to place order. Please try again.', 'error');
    }
  };

  const validateForm = () => {
    const errors: Partial<Address> = {};
    let isValid = true;

    if (!newAddress.label?.trim()) {
      errors.label = 'Full name is required';
      isValid = false;
    }

    if (!newAddress.phone?.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(newAddress.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    if (!newAddress.street?.trim()) {
      errors.state = 'Street address is required';
      isValid = false;
    }

    if (!newAddress.pincode?.trim()) {
      errors.pincode = 'PIN code is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(newAddress.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit PIN code';
      isValid = false;
    }

    if (!newAddress.city?.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!newAddress.state?.trim()) {
      errors.state = 'State is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };


  const fetchAddressDetails = async (pincode: string) => {
    if (pincode.length === 6) {
      setIsLoadingPincode(true);
      setPincodeError('');
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 6);
      setNewAddress(prev => ({ ...prev, [name]: sanitizedValue }));
      if (sanitizedValue.length === 6) {
        fetchAddressDetails(sanitizedValue);
      }
    } else {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name as keyof Address]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-12">
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            show={showToast}
            onClose={() => setShowToast(false)}
          />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl text-gray-800 font-semibold mb-4">Order Summary</h2>
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex items-center">
                  <div className="relative h-20 w-20 rounded overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                    <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6">
              {/* Coupon Section */}
              <div className="mb-4 p-4 border rounded-lg">
                <h3 className="text-lg text-gray-800 font-medium mb-2">Apply Coupon</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 p-2 border rounded-md text-gray-700"
                    disabled={isValidatingCoupon || appliedCoupon !== null}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      disabled={isValidatingCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={validateCoupon}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      disabled={isValidatingCoupon || !couponCode}
                    >
                      {isValidatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-sm text-green-600">
                    Coupon applied: {appliedCoupon.discountType === 'percentage' 
                      ? `${appliedCoupon.discountAmount}% off` 
                      : `₹${appliedCoupon.discountAmount} off`}
                    {appliedCoupon.maxDiscount && ` (Max: ₹${appliedCoupon.maxDiscount})`}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formatCurrency(cartTotal)}</p>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                <p>Shipping</p>
                <p>Free</p>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-base font-medium text-green-600 mt-2">
                  <p>Coupon Discount</p>
                  <p>-{formatCurrency(couponDiscount)}</p>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-gray-900 mt-4">
                <p>Total</p>
                <p>{formatCurrency(cartTotal - couponDiscount)}</p>
              </div>
            </div>
          </div>

          {/* Address Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-gray-800 font-semibold">Delivery Address</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="text-gray-900 hover:text-gray-700 text-sm font-medium"
              >
                + Add New Address
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="w-4 h-4 text-gray-700"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{address.label}</p>
                        <p className="text-gray-600">{address.phone}</p>
                        <p className="text-gray-600">{address.street}</p>
                        {address.apartment && (
                          <p className="text-gray-600">{address.apartment}</p>
                        )}
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.pincode}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-primary text-gray-600 hover:text-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleMakeDefault(address.id)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            Make Default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No addresses added yet. Please add a delivery address.
              </p>
            )}
          </div>

          {/* Address Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddressId(null);
                      setNewAddress({
                        id: '',
                        label: '',
                        phone: '',
                        street: '',
                        apartment: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false
                      });
                      setFormErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>

                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="label"
                      id="label"
                      value={newAddress.label}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter your full name"
                    />
                    {formErrors.label && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.label}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter your phone number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      id="street"
                      value={newAddress.street}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter your street address"
                      required
                    />
                    {formErrors.street && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.street}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      id="apartment"
                      value={newAddress.apartment}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      id="pincode"
                      value={newAddress.pincode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter 6-digit PIN code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                    />
                    {formErrors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.pincode}</p>
                    )}
                    {pincodeError && (
                      <p className="mt-1 text-sm text-red-600">{pincodeError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={newAddress.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                        placeholder="Enter city name"
                        required
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        value={newAddress.state}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-400"
                        placeholder="Enter state name"
                        required
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAddressId(null);
                        setNewAddress({
                          id: '',
                          label: '',
                          phone: '',
                          street: '',
                          apartment: '',
                          city: '',
                          state: '',
                          pincode: '',
                          isDefault: false
                        });
                        setFormErrors({});
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md"
                    >
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Place Order Button */}
          <div className="mt-8">
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || cartTotal <= 0}
              className={`w-full py-3 px-4 rounded-md mb-10 ${!selectedAddressId || cartTotal <= 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}





// here handle in this pages
// fullName as a label
// PhoneNumber as a phone
// address1 as a street
// address2 as a apartment

