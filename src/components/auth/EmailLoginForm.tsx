'use client';

import { useState } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../layout/Layout';
import Preloader from '../ui/preloader';

interface EmailLoginFormProps {
    role: 'client' | 'admin';
    redirectPath: string;
}

export default function EmailLoginForm({ role, redirectPath }: EmailLoginFormProps) {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isFormValid = () => {
        if (isLogin) {
            return formData.email.trim() !== '' && formData.password.trim() !== '';
        } else {
            return (
                formData.email.trim() !== '' &&
                formData.password.trim() !== '' &&
                (role === 'admin' || (formData.name.trim() !== '' && termsAccepted))
            );
        }
    };

    const handleUnauthorizedAccess = async () => {
        setError('Unauthorized access. You are not an admin.');
        await signOut({ redirect: false });
        setTimeout(() => {
            router.push('/login');
        }, 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setLoading(true);
        setError('');

        try {
            if (!isLogin && role === 'client') {
                // Handle signup
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        phoneNumber: formData.phoneNumber,
                        role: 'client'
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                // Clear form data after successful registration
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phoneNumber: ''
                });
                // If registration is successful, proceed with login
            }

            // Handle login
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                role,
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes('unauthorized')) {
                    await handleUnauthorizedAccess();
                    return;
                }
                // Display the exact error message from the server
                setError(result.error);
            } else if (role === 'admin' && result?.ok) {
                // Additional check for admin role after successful login
                const userResponse = await fetch('/api/auth/check-role');
                const userData = await userResponse.json();
                
                if (userData.role !== 'admin') {
                    await handleUnauthorizedAccess();
                    return;
                }
                router.push(redirectPath);
            } else {
                router.push(redirectPath);
            }
        } catch (error: any) {
            setError(error.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen flex flex-col bg-white">
                <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
                    <div className="w-full max-w-[400px] space-y-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-semibold text-gray-900 py-2">Namaste! India</h1>
                            <hr />
                            <h1 className="text-xl font-semibold text-gray-900 py-4">
                                {role === 'admin' ? 'Admin Login' : (isLogin ? 'Sign In' : 'Sign Up')}
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                {role === 'admin'
                                    ? 'Enter your credentials to continue'
                                    : 'Enter your email and password to continue'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && role === 'client' && (
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="mt-1 text-gray-700 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="mt-1 text-gray-700 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Phone Number 
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            className="mt-1 text-gray-700 block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        required
                                        className="text-gray-700 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && role === 'client' && (
                                <div className="flex items-start space-x-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="h-4 w-4 text-gray-700 focus:ring-gray-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-gray-500">
                                            I agree to the{' '}
                                            <Link href="/terms-conditions" className="text-gray-700 hover:text-gray-600">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link href="/privacy-policy" className="text-gray-700 hover:text-gray-600">
                                                Privacy Policy
                                            </Link>
                                            <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    // <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <Preloader/>
                                ) : (
                                    isLogin ? 'Sign In' : 'Sign Up'
                                )}
                            </button>

                            {role === 'client' && (
                                <div className="text-center text-sm">
                                    <p className="text-gray-600">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setError('');
                                                setFormData({ name: '', email: '', password: '', phoneNumber: '' });
                                                setTermsAccepted(false);
                                            }}
                                            className="text-gray-700 hover:text-gray-600 font-medium"
                                        >
                                            {isLogin ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                    {/* Image Showcase Section */}
                    <section className="w-full bg-gray-50 py-16 mt-5">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Experience Luxury Comfort</h2>
              <p className="mt-4 text-lg text-gray-600">Discover our premium collection of bedding essentials</p>
            </div> */}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="group relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                                    <div className="relative h-[300px] w-full">
                                        <Image
                                            src="/images/bedroom-1.jpg"
                                            alt="Modern luxury bedroom"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-lg font-medium">Modern Collection</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                                    <div className="relative h-[300px] w-full">
                                        <Image
                                            src="/images/bedroom-2.jpg"
                                            alt="Minimalist bedroom"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-lg font-medium">Classic Collection</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                                    <div className="relative h-[300px] w-full">
                                        <Image
                                            src="/images/bedroom-3.jpg"
                                            alt="Premium bedroom"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="text-white text-lg font-medium">Premium Collection</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              >
                Explore Collection
              </Link>
            </div> */}
                        </div>
                    </section>
                </main>
            </div>
        </Layout>
    );
}