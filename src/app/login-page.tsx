'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Preloader from '@/components/ui/preloader';

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Ensure loading state lasts for 3 seconds

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
    } else {
      // Redirect based on user role
      if (session.user?.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/client-dashboard');
      }
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === 'loading' || isLoading) {
    return <Preloader />;
  }

  return null;
}
