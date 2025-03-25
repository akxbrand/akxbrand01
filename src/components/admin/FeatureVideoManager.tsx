'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Play, Pause, X } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface FeatureVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  duration?: number;
  viewCount: number;
  isActive: boolean;
}

export default function FeatureVideoManager() {
  const [videos, setVideos] = useState<FeatureVideo[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [selectedVideo, setSelectedVideo] = useState<FeatureVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    isActive: true,
  });
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/feature-videos');
      const data = await response.json();
      if (data.success) {
        setVideos(data.videos);
      } else {
        throw new Error(data.error || 'Failed to fetch videos');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error fetching videos', 'error');
    }
  };

  const initializeCloudinaryWidget = useCallback(() => {
    if (typeof window === 'undefined' || !isScriptLoaded) return null;

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ['local', 'url'],
        resourceType: 'video',
        multiple: false,
        maxFileSize: 104857600,
        styles: {
          palette: {
            window: '#F5F5F5',
            sourceBg: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            inactiveTabIcon: '#69778A',
            menuIcons: '#0078FF',
            link: '#0078FF',
            action: '#0078FF',
            inProgress: '#0078FF',
            complete: '#20B832',
            error: '#EA2727',
            textDark: '#000000',
            textLight: '#FFFFFF'
          }
        }
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          const videoUrl = result.info.secure_url;
          const thumbnailUrl = result.info.thumbnail_url;
          const duration = Math.round(result.info.duration);
          await handleVideoUploadSuccess(videoUrl, thumbnailUrl, duration);
        }
        if (error) {
          showToastMessage('Error uploading video', 'error');
        }
      }
    );

    return widget;
  }, [isScriptLoaded]);

  const handleVideoUploadSuccess = async (videoUrl: string, thumbnailUrl: string, duration: number) => {
    try {
      const response = await fetch('/api/feature-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVideo,
          videoUrl,
          thumbnailUrl,
          duration
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchVideos();
        setNewVideo({ title: '', description: '', isActive: true });
        showToastMessage('Video added successfully', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error adding video', 'error');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this video?')) return;

      const response = await fetch('/api/feature-videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        await fetchVideos();
        showToastMessage('Video deleted successfully', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error deleting video', 'error');
    }
  };

  const handleToggleActive = async (video: FeatureVideo) => {
    try {
      const response = await fetch('/api/feature-videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...video,
          isActive: !video.isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchVideos();
        showToastMessage('Video status updated successfully', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Error updating video status', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const openUploadWidget = () => {
    const widget = initializeCloudinaryWidget();
    if (widget) widget.open();
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const trimmedTitle = newVideo.title.trim();
  //   if (!trimmedTitle) {
  //     showToastMessage('Please enter a valid title', 'error');
  //     return;
  //   }
  //   setNewVideo(prev => ({ ...prev, title: trimmedTitle }));
  //   openUploadWidget();
  // };

  // const formatDuration = (seconds?: number) => {
  //   if (!seconds) return 'N/A';
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  // };

  const handlePlayVideo = (video: FeatureVideo) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          show={showToast}
          onClose={() => setShowToast(false)}
        />
      )}

      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setIsVideoModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="relative w-full" style={{ paddingBottom: '177.78%' }}>
              <iframe
                src={`${selectedVideo.videoUrl}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-gray-900'>Add New Feature Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Video Title"
                value={newVideo.title}
                className='text-gray-700 bg-white'
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Description (optional)"
                value={newVideo.description}
                className='text-gray-700 bg-white'
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newVideo.isActive}
                className="bg-gray-200"
                onCheckedChange={(checked) => setNewVideo({ ...newVideo, isActive: checked })}
              />
              <span className='text-gray-700'>Active</span>
            </div>
            <Button onClick={openUploadWidget} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Upload Video
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-4">
              <div 
                className="relative mb-4 rounded-lg overflow-hidden cursor-pointer"
                style={{ paddingBottom: '177.78%' }} // 9:16 aspect ratio
                onClick={() => handlePlayVideo(video)}
              >
                {video.thumbnailUrl && (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
                  <Play className="w-12 h-12 text-white opacity-75" />
                </div>
              </div>
              <h3 className="font-semibold mb-2 text-gray-800">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-gray-500 mb-2">{video.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={video.isActive}
                    className='bg-gray-200'
                    onCheckedChange={() => handleToggleActive(video)}
                  />
                  <span className={video.isActive ? 'text-green-600' : 'text-gray-500'}>
                    {video.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className='text-red-500 hover:bg-red-100 hover:text-red-600'
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}