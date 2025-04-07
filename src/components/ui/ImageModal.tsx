'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastScale, setLastScale] = useState(1);


  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(prev => Math.min(Math.max(prev + delta, 1), 4));
    }
  }, []);

  useEffect(() => {
    const element = document.getElementById('image-modal-content');
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => element.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Handle pinch-to-zoom start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialTouchDistance(distance);
      setLastScale(scale);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Handle single touch drag and double tap
      const touch = e.touches[0];
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected
        e.preventDefault();
        if (scale === 1) {
          setScale(2);
          setPosition({ x: 0, y: 0 });
        } else {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }
      
      setLastTapTime(currentTime);
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistance !== null) {
      // Handle pinch-to-zoom
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = currentDistance / initialTouchDistance;
      const newScale = Math.min(Math.max(lastScale * scaleFactor, 1), 4);
      setScale(newScale);
    } else if (isDragging && scale > 1 && e.touches.length === 1) {
      // Handle single touch drag
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialTouchDistance(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset zoom and position when modal closes
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="absolute top-4 right-4 z-50 flex gap-2 md:gap-3">
        <button
          onClick={onClose}
          className="p-2 md:p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      <div
        id="image-modal-content"
        className="relative w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => {
          if (scale === 1) {
            setScale(2);
            setPosition({ x: 0, y: 0 });
          } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }
        }}
      >
        <img
          src={imageUrl}
          alt="Zoomed product"
          className="absolute left-1/2 top-1/2 select-none object-contain w-full h-full md:w-auto md:h-auto"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          draggable="false"
        />
      </div>
    </div>
  );
}