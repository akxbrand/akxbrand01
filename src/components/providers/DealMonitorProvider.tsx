'use client';

import { useEffect, useRef } from 'react';

export function DealMonitorProvider({ children }: { children: React.ReactNode }) {
  const monitoringActive = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const startMonitoring = async () => {
    if (monitoringActive.current) return;

    try {
      const response = await fetch('/api/deal-monitor', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to start deal monitoring');
      }
      
      monitoringActive.current = true;
      retryCount.current = 0;
      console.log('Deal monitoring service started successfully');
    } catch (error) {
      console.error('Failed to start deal monitoring service:', error);
      
      // Implement retry logic
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        setTimeout(startMonitoring, RETRY_DELAY);
      }
    }
  };

  const stopMonitoring = async () => {
    if (!monitoringActive.current) return;

    try {
      await fetch('/api/deal-monitor', {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      monitoringActive.current = false;
    } catch (error) {
      console.error('Failed to stop deal monitoring service:', error);
    }
  };

  useEffect(() => {
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, []);

  return <>{children}</>;
}