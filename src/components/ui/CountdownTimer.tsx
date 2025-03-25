'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onExpire?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (Object.values(newTimeLeft).every(value => value === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  return (
    <div className="flex items-center gap-2 text-[10px] font-medium">
      <div className="flex flex-col items-center bg-red-100 rounded-md px-2 py-1">
        <span className="text-red-600">{timeLeft.days}</span>
        <span className="text-[10px] text-red-500">Days</span>
      </div>
      <div className="flex flex-col items-center bg-red-100 rounded-md px-2 py-1">
        <span className="text-red-600">{timeLeft.hours}</span>
        <span className="text-[10px] text-red-500">Hrs</span>
      </div>
      <div className="flex flex-col items-center bg-red-100 rounded-md px-2 py-1">
        <span className="text-red-600">{timeLeft.minutes}</span>
        <span className="text-[10px] text-red-500">Min</span>
      </div>
      <div className="flex flex-col items-center bg-red-100 rounded-md px-2 py-1">
        <span className="text-red-600">{timeLeft.seconds}</span>
        <span className="text-[10px] text-red-500">Sec</span>
      </div>
    </div>
  );
};

export default CountdownTimer;