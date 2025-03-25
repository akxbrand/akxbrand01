'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedEyeProps {
  size?: number;
  blinkInterval?: number;
}

export default function AnimatedEye({
  size = 100,
  blinkInterval = 3000
}: AnimatedEyeProps) {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;
    let initialAnimationDone = false;

    const blink = async () => {
      if (!isMounted || !initialAnimationDone) return;
      try {
        await controls.start({ scaleY: 0.1, transition: { duration: 0.15, ease: 'easeInOut' } });
        if (!isMounted) return;
        await controls.start({ scaleY: 1, transition: { duration: 0.2, ease: 'easeOut' } });
      } catch (error) {
        if (isMounted) console.error('Animation error:', error);
      }
    };

    const startBlinking = async () => {
      if (!isMounted) return;
      try {
        await controls.set({ scaleY: 1 });
        initialAnimationDone = true;
        
        const intervalId = setInterval(async () => {
          if (isMounted && initialAnimationDone) {
            await blink();
          }
        }, blinkInterval);

        return intervalId;
      } catch (error) {
        if (isMounted) console.error('Animation error:', error);
        return undefined;
      }
    };

    let intervalId: NodeJS.Timeout | undefined;
    startBlinking().then(id => {
      if (isMounted) intervalId = id;
    });

    return () => {
      isMounted = false;
      initialAnimationDone = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [controls, blinkInterval]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Eye Shape with Shadow */}
      <div
        style={{
          width: '80%',
          height: '50%',
          background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
          borderRadius: '50%',
          border: '2px solid #2c3e50',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Eyelid with Natural Curve */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={controls}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, #ffffff, #f0f0f0)',
            position: 'relative',
            transformOrigin: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50% 50% 40% 40%'
          }}
        >
          {/* Iris with Realistic Texture */}
          <div
            style={{
              width: '40%',
              height: '80%',
              background: 'radial-gradient(circle at 30% 30%, #7ab3df 0%, #4a6d8c 45%, #2c3e50 100%)',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Iris Detail */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 70% 70%, transparent 0%, rgba(255, 255, 255, 0.1) 100%)',
                mixBlendMode: 'overlay'
              }}
            />
            {/* Pupil */}
            <div
              style={{
                width: '45%',
                height: '45%',
                background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #000000 100%)',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                position: 'relative'
              }}
            >
              {/* Pupil Light Reflection */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '20%',
                  width: '20%',
                  height: '20%',
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 100%)',
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}