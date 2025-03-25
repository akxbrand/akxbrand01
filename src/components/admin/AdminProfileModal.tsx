'use client';

import React from 'react';
import { LogOut, User, Mail, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signOut, useSession } from 'next-auth/react';

export default function AdminProfileModal() {
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin-login' });
  };

  if (!user) return null;

  // Get first letter of name for avatar
  const avatarLetter = user.name?.[0]?.toUpperCase() || 'AK';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">{avatarLetter}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
        </div>
      </SheetTrigger>
      <SheetContent className="!bg-white w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-800">Admin Profile</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-2xl font-medium text-white">{avatarLetter}</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600">Super Administrator</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Full Name</p>
                <p className="text-base text-gray-800">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-base text-gray-800">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-base text-gray-800">{user.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Button 
            variant="destructive" 
            className="w-full flex items-center justify-center space-x-2 bg-white text-red-600 hover:bg-red-100 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}