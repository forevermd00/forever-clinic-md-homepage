export interface PriceOption {
  price: number;
  discountPrice?: number;
  label?: string;
}

export interface TreatmentDoc {
  _id: string;
  _updatedAt: string;
  name: string;
  slug: string;
  category: string;
  isEvent: boolean;
  isSignature: boolean;
  isVisible: boolean;
  sortOrder: number;
  priceOptions?: PriceOption[];
  eventStartDate?: string;
  eventEndDate?: string;
}

export interface TreatmentFullDoc extends TreatmentDoc {
  nameFull?: { ko?: string; en?: string; zh?: string; ja?: string };
  tagline?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  keywords?: { ko?: string; en?: string };
  composition?: { ko?: string; en?: string };
  treatmentTime?: string;
  anesthesia?: { ko?: string };
  downtime?: string;
  duration?: string;
}

export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'all', label: '전체' },
  { slug: '_event', label: '이벤트' },
  { slug: 'lifting-laser', label: '리프팅·레이저' },
  { slug: 'petit-lifting', label: '쁘띠·실리프팅' },
  { slug: 'skincare', label: '피부 관리' },
  { slug: 'skin-booster', label: '스킨부스터' },
  { slug: 'hair-removal', label: '제모' },
  { slug: 'anesthesia', label: '마취' },
];

export const CATEGORY_LABEL: Record<string, string> = {
  'lifting-laser': '리프팅·레이저',
  'petit-lifting': '쁘띠·실리프팅',
  skincare: '피부 관리',
  'skin-booster': '스킨부스터',
  'hair-removal': '제모',
  anesthesia: '마취',
};

export const EDITABLE_CATEGORIES = CATEGORIES.filter(
  (c) => c.slug !== 'all' && c.slug !== '_event',
);
