'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EmailLoginForm from '@/components/auth/EmailLoginForm';

export default function AdminLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.role === 'client') {
      router.push('/');
    } else if (session?.user?.role === 'admin') {
      // Only redirect to admin page if the user is on the admin-login page
      router.push('/admin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <EmailLoginForm role="admin" redirectPath="/admin" />;
}
