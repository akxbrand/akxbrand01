'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NetworkStatusContextType {
  isOnline: boolean;
  hasVisitedBefore: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  hasVisitedBefore: false,
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const visited = localStorage.getItem('hasVisitedBefore');
    if (!visited) {
      localStorage.setItem('hasVisitedBefore', 'true');
      setHasVisitedBefore(false);
    } else {
      setHasVisitedBefore(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      if (pathname === '/network-error') {
        router.back();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (!pathname?.includes('/network-error')) {
        router.push('/network-error');
      }
    };

    // Set up network status check interval
    const checkConnection = () => {
      if (navigator.onLine && !isOnline) {
        handleOnline();
      } else if (!navigator.onLine && isOnline) {
        handleOffline();
      }
    };

    // Check connection status every 3 seconds
    const intervalId = setInterval(checkConnection, 3000);

    // Add event listeners for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [router, pathname, isOnline]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, hasVisitedBefore }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}