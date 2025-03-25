"use client";

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the shop page with both category and subcategory as query parameters
    router.replace(`/shop?category=${params.category}&subcategory=${params.subcategory}`);
  }, [params.category, params.subcategory, router]);

  return null; // This page won't render anything as it immediately redirects
}