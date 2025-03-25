export type ReviewMediaType = 'photo' | 'video';

export interface ReviewMedia {
  id: string;
  type: ReviewMediaType;
  url: string;
  thumbnailUrl?: string; // For videos
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  media: ReviewMedia[];
  createdAt: string;
  isVerified: boolean;
  isHidden: boolean;
  reportCount: number;
  adminNotes?: string;
  isFeatured: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 stars distribution
  };
  mediaCount: {
    photo: number;
    video: number;
  };
}
