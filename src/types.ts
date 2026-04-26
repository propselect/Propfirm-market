export type Rating = 'good' | 'medium' | 'bad' | 'unrated';

export interface PropFirm {
  id: string;
  name: string;
  rating?: Rating;
  websiteUrl: string;
  logoUrl?: string;
  description: string;
  pros: string[];
  cons: string[];
  startingBalance: string;
  maxLeverage: string;
  profitSplit: string;
  slug: string;
  discountCode?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  firmId?: string;
  firmName?: string;
  fullPath?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Vote {
  id: string;
  userId: string;
  firmId: string;
  createdAt: any;
}
