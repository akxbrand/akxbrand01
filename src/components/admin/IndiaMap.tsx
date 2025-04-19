'use client';

import React, { useState } from 'react';
import statesPaths from './statesPaths';

interface MousePosition {
  x: number;
  y: number;
}

interface StateData {
  name: string;
  value: number;
  orders?: number;
  revenue?: number;
  customers?: number;
}

interface IndiaMapProps {
  stateData: StateData[];
  metric: 'orders' | 'revenue' | 'customers';
}

const IndiaMap: React.FC<IndiaMapProps> = ({ stateData, metric }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const getStateColor = (value: number) => {
    // Color scale from light to dark indigo based on value
    const maxValue = Math.max(...stateData.map(state => state.value));
    const intensity = (value / maxValue) * 100;
    return `rgba(79, 70, 229, ${0.2 + (intensity * 0.8) / 100})`;
  };

  const getTooltipContent = (state: StateData) => {
    return (
      <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{state.name}</p>
        {metric === 'orders' && (
          <p className="text-gray-600">Orders: {state.orders?.toLocaleString()}</p>
        )}
        {metric === 'revenue' && (
          <p className="text-gray-600">Revenue: ₹{state.revenue?.toLocaleString('en-IN')}</p>
        )}
        {metric === 'customers' && (
          <p className="text-gray-600">Customers: {state.customers?.toLocaleString()}</p>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[400px]" onMouseMove={handleMouseMove}>
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: '700px' }}
      >
        {stateData.map((state) => (
          <path
            key={state.name}
            d={statesPaths[state.name as keyof typeof statesPaths]}
            fill={getStateColor(state.value)}
            stroke="#fff"
            strokeWidth="1"
            onMouseEnter={() => setHoveredState(state.name)}
            onMouseLeave={() => setHoveredState(null)}
            className="transition-colors duration-200 hover:opacity-80 cursor-pointer"
            style={{ strokeWidth: '0.5' }}
          />
        ))}
      </svg>
      {hoveredState && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none z-10"
          style={{ left: mousePos.x, top: mousePos.y - 10 }}
        >
          {getTooltipContent(stateData.find(state => state.name === hoveredState)!)}
        </div>
      )}
    </div>
  );
};

export default IndiaMap;