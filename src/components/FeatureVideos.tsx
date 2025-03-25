'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import '@/styles/video-carousel.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import type { Swiper as SwiperType } from 'swiper';
import type { SwiperRef } from 'swiper/react';

interface FeatureVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function FeatureVideos() {
  const [videos, setVideos] = useState<FeatureVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const containerRef = useRef<SwiperRef>(null);
  const [videoMuteStates, setVideoMuteStates] = useState<{ [key: string]: boolean }>({});

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
          // Only show videos that are marked as active
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

  const handleSlideChange = (swiper: any) => {
    const activeIndex = swiper.activeIndex;
    const slides = swiper.slides;

    // Pause all videos first
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (video) {
        video.pause();
        if (activeVideoId === id) {
          setActiveVideoId(null);
        }
      }
    });

    // Play the center video
    if (slides[activeIndex]) {
      const videoElement = slides[activeIndex].querySelector('video');
      if (videoElement) {
        const videoId = videoElement.dataset.videoId;
        setActiveVideoId(videoId);
        videoElement.play().catch((error : any) => console.log('Play on center failed:', error));
      }
    }
  };

  const handleVideoHover = (videoId: string, isHovering: boolean) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    // Only allow hover interactions for the center slide
    const swiper = containerRef.current?.swiper;
    if (swiper) {
      const activeIndex = containerRef.current?.swiper.activeIndex;
      const activeSlide = containerRef.current?.swiper.slides[activeIndex || 0];
      const activeVideo = activeSlide?.querySelector('video');
      
      if (activeVideo?.dataset.videoId === videoId) {
        if (isHovering) {
          setActiveVideoId(videoId);
          video.play().catch((error) => console.log('Play on hover failed:', error));
        } else {
          setActiveVideoId(null);
          video.pause();
        }
      }
    }
  };

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
    <section className="py-12 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
        See it Live , Love it forever !
        </h2>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover our handpicked collection of inspiring stories and experiences
        </p>
        <Swiper
          ref={containerRef}
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={3}
          initialSlide={1}
          coverflowEffect={{
            rotate: 20,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="video-carousel-container justify-center relative py-10"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id}>
              <div 
                className={`video-card relative rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 ${activeVideoId === video.id ? 'active' : ''}`}
                onMouseEnter={() => handleVideoHover(video.id, true)}
                onMouseLeave={() => handleVideoHover(video.id, false)}
              >
              <video
                ref={(el) => { videoRefs.current[video.id] = el }}
                className="w-full aspect-[9/16] object-cover"
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                muted={videoMuteStates[video.id]}
                playsInline
                loop
                preload="metadata"
                autoPlay={activeVideoId === video.id}
                data-video-id={video.id}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleVideoMute(video.id);
                }}
                className="absolute bottom-4 right-4 bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors z-50 backdrop-blur-sm"
                aria-label={videoMuteStates[video.id] ? 'Unmute video' : 'Mute video'}
              >
                {videoMuteStates[video.id] ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h3 className="text-white font-semibold text-xl mb-2">{video.title}</h3>
                <p className="text-white/90 text-base leading-relaxed">{video.description}</p>
              </div>
              </div>
            </SwiperSlide>
          ))}
          {/* <button className="swiper-button-prev absolute left-2 z-10 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button className="swiper-button-next absolute right-2 z-10 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
            <ChevronRight className="w-6 h-6 text-white" />
          </button> */}
        </Swiper>
      </div>
    </section>
  );
}
