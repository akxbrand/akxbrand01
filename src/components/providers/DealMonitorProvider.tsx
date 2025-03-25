'use client';

import { useEffect } from 'react';

export function DealMonitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeDealMonitoring = async () => {
      try {
        const response = await fetch('/api/deal-monitor', {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to start deal monitoring');
        }
        
        console.log('Deal monitoring service started successfully');
      } catch (error) {
        console.error('Failed to start deal monitoring service:', error);
      }
    };

    initializeDealMonitoring();

    // Cleanup function to stop the monitoring when the component unmounts
    return () => {
      fetch('/api/deal-monitor', {
        method: 'DELETE',
      }).catch(error => {
        console.error('Failed to stop deal monitoring service:', error);
      });
    };
  }, []);

  return <>{children}</>;
}