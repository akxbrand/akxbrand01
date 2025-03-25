"use client";

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the shop page with the category as a query parameter
    router.replace(`/shop?category=${params.category}`);
  }, [params.category, router]);

  return null; // This page won't render anything as it immediately redirects
}