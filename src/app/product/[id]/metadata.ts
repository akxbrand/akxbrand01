import { Metadata } from 'next';
import prisma from '@/lib/prisma';

interface ProductMetadata {
  id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  oldPrice?: number;
  category: {
    name: string;
  };
  subCategory?: {
    name: string;
  };
  reviews: Array<{ rating: number }>;
}

function calculateAverageRating(reviews: Array<{ rating: number }>) {
  if (!reviews.length) return null;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  // Fetch product data
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      subCategory: true,
      reviews: {
        select: { rating: true }
      }
    }
  }) as ProductMetadata | null;

  if (!product) {
    return {
      title: 'Product Not Found - AKX Brand',
      description: 'The requested product could not be found.'
    };
  }

  const averageRating = calculateAverageRating(product.reviews);
  const productPrice = product.price.toFixed(2);
  const productName = product.name;
  const brandName = 'AKX Brand';
  const productUrl = `https://akxbrand.com/product/${product.id}`;
  const productImage = product.images[0] || '';
  
  // Construct breadcrumb structure
  const breadcrumb = [
    { name: brandName, item: 'https://akxbrand.com' },
    { name: product.category.name, item: `https://akxbrand.com/shop?category=${product.category.name}` },
    ...(product.subCategory ? [{ name: product.subCategory.name, item: `https://akxbrand.com/shop?subcategory=${product.subCategory.name}` }] : []),
    { name: productName, item: productUrl }
  ];

  // Construct JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: brandName
    },
    offers: {
      '@type': 'Offer',
      price: productPrice,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: productUrl
    },
    ...(averageRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount: product.reviews.length
      }
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.item
      }))
    }
  };

  return {
    title: `${productName} - ${brandName}`,
    description: product.description || `Buy ${productName} from ${brandName}. ${product.category.name} collection.`,
    openGraph: {
      title: `${productName} - ${brandName}`,
      description: product.description,
      images: [{
        url: productImage,
        width: 1200,
        height: 630,
        alt: productName
      }],
      type: "website",
      url: productUrl,
      siteName: brandName
    },
    twitter: {
      card: 'summary_large_image',
      title: `${productName} - ${brandName}`,
      description: product.description,
      images: [productImage]
    },
    alternates: {
      canonical: productUrl,
      types: {
        'application/ld+json': JSON.stringify(jsonLd)
      }
    },
    other: {
      'price': productPrice,
      'currency': 'INR'
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    },
    verification: {
      google: 'your-google-verification-code',
    }
  };
}