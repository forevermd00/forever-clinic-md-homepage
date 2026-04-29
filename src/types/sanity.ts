export interface SanityImage {
  _type: 'image';
  asset: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number; width: number; height: number };
}

export interface PriceOption {
  name: string;
  price: number;
  discountPrice?: number;
}

export interface TreatmentCard {
  _id: string;
  name: string;
  tagline: string;
  category: string;
  slug: string;
  thumbnail: SanityImage;
  priceOptions: PriceOption[];
  isEvent: boolean;
}

export interface TreatmentDetail extends TreatmentCard {
  detailImage: SanityImage;
  effects: string[];
  duration: string;
  downtime: string;
  treatmentTime: string;
  faq: { question: string; answer: string }[];
  relatedTreatments: TreatmentCard[];
}

export interface BACase {
  _id: string;
  beforeImage: SanityImage;
  afterImage: SanityImage;
  treatment: { _id: string; name: string; slug: string; category: string };
  sessions: string;
  elapsed: string;
  description?: string;
  prevCase?: { _id: string };
  nextCase?: { _id: string };
}

export interface Promotion {
  _id: string;
  title: string;
  image: SanityImage;
  description?: string;
  eventPrice: number;
  startDate: string;
  endDate: string;
  treatment: { name: string; slug: string; priceOptions: PriceOption[] };
}

export interface Doctor {
  _id: string;
  name: string;
  position: string;
  profileImage: SanityImage;
  philosophy: string;
  licenseNumber?: string;
  specialties: string[];
  careers: string[];
}

export interface PageHero {
  title: string;
  subtitle: string;
  heroImage?: SanityImage;
  heroVideo?: { asset: { _ref: string } };
}

export interface ClinicInfo {
  address: string;
  phone: string;
  email: string;
  businessHours: { day: string; open: string; close: string; note?: string }[];
  closedDayNotice: string;
  googleMapsEmbedUrl: string;
  walkingGuide: string;
  snsLinks: { platform: string; url: string; label: string }[];
  messengerLinks: { platform: string; url: string; label: string }[];
}

export interface QuickEntryCardData {
  _id: string;
  title: string;
  description: string;
  icon?: SanityImage;
  linkUrl: string;
}

export interface BrandPhilosophy {
  slogan: string;
  values: {
    title: string;
    description: string;
    backgroundImage: SanityImage;
  }[];
}

export interface StatsItem {
  value: string;
  label: string;
}

export interface PressArticle {
  _id: string;
  title: string;
  publisher: string;
  url: string;
  thumbnail: SanityImage;
  publishedAt: string;
}

export interface YouTubeVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  thumbnail: SanityImage;
  description?: string;
  duration?: string;
  publishedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  thumbnail: SanityImage;
  excerpt: string;
  category?: string;
  publishedAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  category: string;
  publishedAt: string;
  isPinned: boolean;
}

export interface Facility {
  _id: string;
  name: string;
  image: SanityImage;
  description: string;
}

export interface Equipment {
  _id: string;
  name: string;
  image: SanityImage;
  description: string;
  relatedTreatments: { name: string; slug: string }[];
}

export interface EventPopup {
  _id: string;
  image: SanityImage;
  title: string;
  description: string;
  targetLocales: string[];
  enableDismiss: boolean;
}
