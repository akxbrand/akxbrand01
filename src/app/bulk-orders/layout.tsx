import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Orders | AKX Brand - Premium Bedding & Home Essentials',
  description: 'Get special pricing and custom delivery options for bulk orders of premium bedding and home essentials. Perfect for hotels, resorts, and large organizations.',
  keywords: 'bulk orders, wholesale bedding, business orders, hotel supplies, bulk pricing, wholesale home essentials'
};

export default function BulkOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}