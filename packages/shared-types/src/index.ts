// User Roles
export type UserRole = 
  | 'STUDENT'
  | 'FACULTY'
  | 'CLUB'
  | 'ALUMNI'
  | 'MODERATOR'
  | 'COLLEGE_ADMIN'
  | 'SUPER_ADMIN';

// Product Transaction Types
export type TransactionType =
  | 'BUY'
  | 'SELL'
  | 'RENT'
  | 'BORROW'
  | 'EXCHANGE'
  | 'DONATE';

// Product Statuses
export type ProductStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'RENTED'
  | 'BORROWED'
  | 'EXCHANGED'
  | 'DONATED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'ARCHIVED';

// Product Conditions
export type ProductCondition =
  | 'NEW'
  | 'LIKE_NEW'
  | 'GOOD'
  | 'FAIR'
  | 'POOR';

// Core Domain Interfaces
export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  collegeId: string;
  departmentId?: string;
  year?: number;
  branch?: string;
  bio?: string;
  badges: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICollege {
  id: string;
  name: string;
  code: string;
  domains: string[];
  city: string;
  state: string;
  country: string;
  logo?: string;
  createdAt: string;
}

export interface IProductAIAnalysis {
  recommendedPrice: number;
  quickSalePrice: number;
  scamScore: number;
  aiSummary: string;
  isFlagged: boolean;
}

export interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  rentalPrice?: number;
  condition: ProductCondition;
  category: string;
  images: string[];
  sellerId: string;
  seller?: Partial<IUser>;
  collegeId: string;
  departmentId?: string;
  pickupLocation: string;
  pickupTime?: string;
  isNegotiable: boolean;
  transactionType: TransactionType;
  status: ProductStatus;
  viewsCount: number;
  likesCount: number;
  tags: string[];
  aiAnalysis?: IProductAIAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface IChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  image?: string;
  file?: string;
  seen: boolean;
  createdAt: string;
}

export interface IChat {
  id: string;
  participants: Partial<IUser>[];
  lastMessage?: IChatMessage;
  productId?: string;
  updatedAt: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
