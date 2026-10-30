export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
  title?: string;
  userEmail?: string;
  userMobile?: string;
  subRatings?: {
    serviceQuality: number;
    valueForMoney: number;
    cleanliness: number;
  };
  photos?: string[];
  helpfulCount?: number;
  unhelpfulCount?: number;
  ownerResponse?: {
    text: string;
    date: string;
    responder: string;
  };
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  area: string;
  address: string;
  phone: string;
  whatsapp?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isFeatured?: boolean;
  priceRange?: string;
  services: string[];
  timings: string;
  images: string[];
  reviews: Review[];
  postedDate: string;
  badge?: string;
  email?: string;
  status?: 'Active' | 'Pending Approval' | 'Expired';
  viewsCount?: number;
  postedByUser?: string;
}

export interface Category {
  id: string;
  name: string;
  nameTe: string; // Telugu translation
  icon: string;
  description: string;
  count: number;
  image?: string;
  iconBg?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: 'provider' | 'customer';
  name: string;
  mobile?: string;
}

export interface Area {
  id: string;
  name: string;
  landmark: string;
}

export interface ClassifiedItem {
  id: string;
  title: string;
  category: string;
  price: string;
  condition: string;
  location: string;
  phone: string;
  whatsapp?: string;
  date: string;
  image: string;
  description: string;
  postedBy: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  teluguName: string;
  phone: string;
  category: string;
  description: string;
  available247: boolean;
  address?: string;
}
