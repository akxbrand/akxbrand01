'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
  id: string;
  message: string;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: number;
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const { success, announcements: data } = await response.json();
        if (!success) throw new Error('Failed to fetch announcements');
        
        setAnnouncements(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (isLoading || announcements.length === 0) return null;

  return (
    <div className="bg-gray-900 text-white py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-6 overflow-hidden">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center text-sm font-medium tracking-wide"
            >
              {announcements[currentIndex].message}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}