import { NextConfig } from 'next';
import nextConfig from '../../next.config';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageUrl = (url: string): ValidationResult => {
  try {
    // Check if the URL is valid
    const parsedUrl = new URL(url);

    // Get allowed domains from next.config.ts
    const allowedDomains = (nextConfig.images as { domains: string[] })?.domains || [];

    // Check if the hostname is allowed
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      return {
        isValid: false,
        error: `Invalid image host. Allowed hosts are: ${allowedDomains.join(', ')}`
      };
    }

    // Check if the URL points to an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = imageExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'URL must point to a valid image file (.jpg, .jpeg, .png, .gif, or .webp)'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};