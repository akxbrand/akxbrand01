export interface ProductSize {
  id: string;
  size: string;
  description?: string;
  uniqueFeatures: string,
  productDetails: string,
  careInstructions: string,
  deliveryReturns: string,
  oldPrice?: number;
  price: number;
  stock: number;
  isLimitedTimeDeal: boolean;
  dealStartTime?: string;
  dealEndTime?: string;
  dealQuantityLimit?: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  nickname?: string;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  subCategoryId?: string;
  subCategory?: {
    id: string;
    name: string;
  };
  oldPrice?: number;
  price: number;
  stock: number;
  status: string;
  isLimitedTimeDeal: boolean;
  dealStartTime?: string;
  dealEndTime?: string;
  dealQuantityLimit?: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isTop10: boolean;
  isLimitted: boolean;
  weeklySales: number;
  sizes: ProductSize[];
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
  returnPolicy?: string;
  deliveryInfo?: string;
  careInstructions?: string[];
  createdAt: Date;
  updatedAt: Date;
}
