'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import AnnouncementBar from './AnnouncementBar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname?.startsWith('/admin');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!pathname?.includes('/network-error')) {
        router.push('/network-error');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router, pathname]);

  return (
    <>
     {/* {!isAdminPage && <AnnouncementBar />} */}
      {children}
      {!isAdminPage && <WhatsAppButton phoneNumber="+919034366104" />}
    </>
  );
}