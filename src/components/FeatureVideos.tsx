'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface FeatureVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function FeatureVideos() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 4 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 640px)': { slidesToScroll: 2 }
    }
  });
  const [videos, setVideos] = useState<FeatureVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [videoMuteStates, setVideoMuteStates] = useState<{ [key: string]: boolean }>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    const initialMuteStates = videos.reduce((acc, video) => {
      acc[video.id] = isMuted;
      return acc;
    }, {} as { [key: string]: boolean });
    setVideoMuteStates(initialMuteStates);
  }, [videos, isMuted]);

  const toggleVideoMute = (videoId: string) => {
    setVideoMuteStates(prev => {
      const newState = { ...prev, [videoId]: !prev[videoId] };
      if (videoRefs.current[videoId]) {
        videoRefs.current[videoId]!.muted = newState[videoId];
      }
      return newState;
    });
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/feature-videos');
        const data = await response.json();
        if (data.success) {
          const activeVideos = data.videos.filter((video: FeatureVideo & { isActive?: boolean }) => video.isActive !== false);
          setVideos(activeVideos);
        }
      } catch (error) {
        console.error('Error fetching feature videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoHover = (videoId: string, isHovering: boolean) => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      
      if (isHovering && id === videoId) {
        setActiveVideoId(videoId);
        video.play().catch((error) => console.log('Play on hover failed:', error));
      } else if (isHovering && id !== videoId) {
        video.pause();
      } else if (!isHovering) {
        if (id === videoId) setActiveVideoId(null);
        video.play().catch((error) => console.log('Play on hover failed:', error));
      }
    });
  };

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    });
  }, [emblaApi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          See it Live, Love it forever!
        </h2>
        <p className="text-base text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover our handpicked collection of inspiring stories and experiences
        </p>
        <div className="relative">
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className={`flex -ml-3 ${(videos.length > 4) ? null : 'justify-center'}`}>
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex-[0_0_50%] min-w-0 pl-3 sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_18%] p-2"
                >
                  <div
                    className={`video-card relative rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 origin-center ${activeVideoId === video.id ? 'scale-105' : ''} hover:scale-105`}
                    onMouseEnter={() => handleVideoHover(video.id, true)}
                    onMouseLeave={() => handleVideoHover(video.id, false)}
                  >
                    <video
                      ref={(el) => { videoRefs.current[video.id] = el }}
                      className="w-full aspect-[9/16] object-contain"
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      muted={videoMuteStates[video.id]}
                      playsInline
                      loop
                      autoPlay
                      data-video-id={video.id}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleVideoMute(video.id);
                      }}
                      className="absolute bottom-3 right-3 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors z-50 backdrop-blur-sm"
                      aria-label={videoMuteStates[video.id] ? 'Unmute video' : 'Mute video'}
                    >
                      {videoMuteStates[video.id] ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{video.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 bg-transparent bg-blure hover:bg-transparent hover:bg-blure backdrop-blur p-2.5 rounded-full shadow-md hover:bg-white/80 transition-colors ${!canScrollPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canScrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 bg-transparent bg-blure hover:bg-transparent hover:bg-blure backdrop-blur p-2.5 rounded-full shadow-md hover:bg-white/80 transition-colors ${!canScrollNext ? 'opacity-50 cursor-not-allowed' : ''}`}
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
