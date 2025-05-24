import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Orders | AKX Brand - Premium Bedding & Home Essentials',
  description: 'Get special pricing and custom delivery options for bulk orders of premium bedding and home essentials. Perfect for hotels, resorts, and large organizations.',
  keywords: 'bedsheets, fitted bedsheets, elastic bedsheets, comforter, comforters, comforter set, bedding set, duvet cover, curtains, pillow covers, diwan sets'
};

export default function BulkOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
