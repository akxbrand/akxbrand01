import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home,
  Image as ImageIcon, 
  LayoutGrid, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag,
  Video,
  Mail,
  Building,
  Megaphone
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      href: '/admin',
    },
    {
      title: 'Announcements',
      icon: <Megaphone className="w-5 h-5" />,
      href: '/admin/announcements',
    },
    {
      title: 'Banners',
      icon: <ImageIcon className="w-5 h-5" />,
      href: '/admin/banners',
    },
    {
      title: 'Categories',
      icon: <LayoutGrid className="w-5 h-5" />,
      href: '/admin/categories',
    },
    {
      title: 'Products',
      icon: <Package className="w-5 h-5" />,
      href: '/admin/products',
    },
    {
      title: 'Orders',
      icon: <ShoppingCart className="w-5 h-5" />,
      href: '/admin/orders',
    },
    {
      title: 'Bulk Orders',
      icon: <Building className="w-5 h-5" />,
      href: '/admin/bulk-orders',
    },
    {
      title: 'Customers',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/customers',
    },
    {
      title: 'Coupons',
      icon: <Tag className="w-5 h-5" />,
      href: '/admin/coupons',
    },
    
    {
      title: 'Feature Videos',
      icon: <Video className="w-5 h-5" />,
      href: '/admin/feature-videos',
    },
    // {
    //   title: 'Testimonials',
    //   icon: <Video className="w-5 h-5" />,
    //   href: '/admin/testimonial',
    // },
    {
      title: 'Newsletter',
      icon: <Mail className="w-5 h-5" />,
      href: '/admin/newsletter',
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col">
      <div className="flex items-center space-x-2 px-2 py-2 border-b border-gray-100 items-center justify-center">
        <Image
          src="/images/brand-logo.png"
          alt="AKX Brand Logo"
          width={110}
          height={100}
          className="flex items-center justify-center"
        />
      </div>
      <nav className="py-4 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-6 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 ${
                isActive ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
