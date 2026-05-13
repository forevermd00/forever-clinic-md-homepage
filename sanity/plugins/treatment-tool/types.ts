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

export const CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'all', label: '전체' },
  { slug: 'lifting-laser', label: '리프팅·레이저' },
  { slug: 'petit-lifting', label: '쁘띠·실리프팅' },
  { slug: 'skincare', label: '피부 관리' },
  { slug: 'skin-booster', label: '스킨부스터' },
  { slug: 'hair-removal', label: '제모' },
  { slug: 'anesthesia', label: '마취크림' },
  { slug: 'signature', label: '시그니처' },
  { slug: '_event', label: '이벤트' },
];

export const CATEGORY_LABEL: Record<string, string> = {
  'lifting-laser': '리프팅·레이저',
  'petit-lifting': '쁘띠·실리프팅',
  skincare: '피부 관리',
  'skin-booster': '스킨부스터',
  'hair-removal': '제모',
  anesthesia: '마취크림',
  signature: '시그니처',
};

export const EDITABLE_CATEGORIES = CATEGORIES.filter(
  (c) => c.slug !== 'all' && c.slug !== '_event',
);
