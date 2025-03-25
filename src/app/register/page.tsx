'use client';

import { useSearchParams } from 'next/navigation';
import RegistrationForm from '@/components/auth/RegistrationForm';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const phoneNumber = searchParams?.get('phoneNumber');

  if (!phoneNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Invalid Registration Link</h1>
          <p className="mt-2 text-gray-600">Please go through the proper registration process.</p>
        </div>
      </div>
    );
  }

  return <RegistrationForm phoneNumber={phoneNumber} />;
}