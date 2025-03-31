'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - startPosition.x;
    const newY = e.clientY - startPosition.y;

    // Calculate boundaries
    if (containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const maxX = (containerRect.width * (scale - 1)) / 2;
      const maxY = (containerRect.height * (scale - 1)) / 2;

      setPosition({
        x: Math.min(Math.max(-maxX, newX), maxX),
        y: Math.min(Math.max(-maxY, newY), maxY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  useEffect(() => {
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{ touchAction: 'none' }}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s',
          transformOrigin: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 750px) 100vw, 50vw"
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}