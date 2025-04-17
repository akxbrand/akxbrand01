'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { NetworkStatusProvider } from '@/components/providers/NetworkStatusProvider';
import VisitTracker from './VisitTracker';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <NetworkStatusProvider>
      <VisitTracker />
      {children}
      {!isAdminPage && <WhatsAppButton phoneNumber="+919034366104" />}
    </NetworkStatusProvider>
  );
}