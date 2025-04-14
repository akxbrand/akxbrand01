import React, { useEffect, useRef } from 'react';
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`w-64 h-[100dvh] bg-white border-r border-gray-100 fixed left-0 top-0 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-20 overflow-hidden`}
        ref={sidebarRef}
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center space-x-2 px-2 py-2 border-b border-gray-100 items-center justify-center sticky top-0 bg-white z-10">
        <Image
          src="/images/brand-logo.png"
          alt="AKX Brand Logo"
          width={110}
          height={100}
          className="flex items-center justify-center"
          priority
        />
      </div>
      <nav className="py-4 flex-1 overflow-y-auto webkit-overflow-scrolling-touch">
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
    </>
  );
}
