'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import { DealMonitorProvider } from '@/components/providers/DealMonitorProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <DealMonitorProvider>
          {children}
          <Toaster position="bottom-left" />
        </DealMonitorProvider>
      </CartProvider>
    </SessionProvider>
  );
}
