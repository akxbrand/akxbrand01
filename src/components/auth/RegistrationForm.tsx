'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../layout/Layout';
import { Camera } from 'lucide-react';

interface RegistrationFormProps {
  phoneNumber: string;
}

interface UserRegistrationData {
  name: string;
  phoneNumber: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email?: string;
  profilePicture?: string;
}

export default function RegistrationForm({ phoneNumber }: RegistrationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UserRegistrationData>({
    name: '',
    phoneNumber,
    age: 18,
    gender: 'male',
    email: '',
    profilePicture: ''
  });

  const [previewImage, setPreviewImage] = useState<string>('/images/default-avatar.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === 'age') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 18
      }));
      return;
    }
    
    if (name === 'profilePicture' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({
          ...prev,
          profilePicture: result
        }));
      };
      
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful
      await router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-[400px] bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="relative w-32 h-32 mx-auto cursor-pointer group" onClick={handleProfilePictureClick}>
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-200 transition-all duration-300 group-hover:border-gray-300">
                  <Image
                    src={previewImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Complete Your Profile</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Please provide your details to complete the registration
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  disabled
                  className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="mt-1 block w-full px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2.5 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition duration-200 ease-in-out"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600 text-center">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}