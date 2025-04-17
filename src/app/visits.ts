'use client';

export async function recordVisit() {
  try {
    // Check if localStorage is available (client-side)
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    // Check if visit was already recorded today
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    const visitId = localStorage.getItem('visitId') || Math.random().toString(36).substring(2);
    
    if (lastVisit !== today) {
      // Record new visit
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visitorId: visitId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record visit');
      }
      
      // Update last visit date and visitor ID
      localStorage.setItem('lastVisit', today);
      localStorage.setItem('visitId', visitId);
    }
  } catch (error) {
    console.error('Error recording visit:', error);
  }
}