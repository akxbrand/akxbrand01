import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Login page for administrators',
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
