'use client';

import { useEffect } from 'react';
import { recordVisit } from '@/app/visits';

export default function VisitTracker() {
  useEffect(() => {
    recordVisit();
  }, []);

  return null;
}