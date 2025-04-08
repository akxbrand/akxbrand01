'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
  isFeatured?: boolean;
  media?: Array<{
    id: string;
    url: string;
  }>;
}

export default function CustomerReviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 1024px)': { slidesToScroll: 3 },
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 640px)': { slidesToScroll: 1 }
      }
    },
    [AutoPlay({ delay: 4000, stopOnInteraction: false })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    });
  }, [emblaApi]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        const response = await fetch('/api/reviews/featured');
        const data = await response.json();

        if (data.success) {
          setReviews(data.reviews.filter((review: Review) => review.isFeatured));
        } else {
          setError(data.error || 'Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching featured reviews:', error);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-gray-600">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // const [reviews] = useState<Review[]>([


  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
          What Our Customers Say
        </h2>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Real stories from our valued customers about their experience with our products
        </p>
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] relative mx-4"
                >
                  <div className="flex items-center mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={review.image || '/images/user.png'}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="flex font-semibold text-gray-900">{review.name} <p className="text-sm text-gray-400 mt-[1px] ml-2">{review.date}</p></h3>
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                  {review.media && review.media.length > 0 && (
                    <div className="review-media-grid">
                      {review.media.map((media) => (
                        <div
                          key={media.id}
                          className="review-media-item cursor-pointer"
                          onClick={() => window.open(media.url)}
                        >
                          <Image
                            src={media.url}
                            alt="Review media"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur p-2.5 rounded-full shadow-md hover:bg-white/80 transition-colors ${!canScrollPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 backdrop-blur p-2.5 rounded-full shadow-md hover:bg-white/80 transition-colors ${!canScrollNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canScrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
}