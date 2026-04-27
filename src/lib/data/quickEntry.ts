import { sanityFetch } from '@/lib/sanity/fetch';
import { quickEntryCardsQuery } from '@/lib/sanity/queries';

interface SanityQuickEntryCard {
  _id: string;
  title?: string;
  description?: string;
  icon?: { asset?: { _ref: string } };
  linkUrl?: string;
}

interface QuickEntryCard {
  id: string;
  title: string;
  description: string;
  image: string;
  linkUrl: string;
}

/* Hardcoded fallback data matching the current QuickEntrySection */
const fallbackCards: Record<string, QuickEntryCard[]> = {
  treatment: [
    {
      id: 't1',
      title: '리프팅',
      description: '처진 피부를 끌어올려 탄력을 되찾아 드립니다',
      image: '/images/home/qe-lifting.png',
      linkUrl: '/treatments?category=lifting',
    },
    {
      id: 't2',
      title: '피부케어',
      description: '건강한 피부 본연의 광채를 되살리는 케어',
      image: '/images/home/qe-skincare.png',
      linkUrl: '/treatments?category=skincare',
    },
    {
      id: 't3',
      title: '토닝·색소',
      description: '균일한 피부톤으로 맑은 인상을 완성합니다',
      image: '/images/home/qe-toning.png',
      linkUrl: '/treatments?category=toning',
    },
    {
      id: 't4',
      title: '보톡스·필러',
      description: '자연스러운 볼륨과 라인으로 아름다움을',
      image: '/images/home/qe-botox.jpg',
      linkUrl: '/treatments?category=botox-filler',
    },
  ],
  concern: [
    {
      id: 'c1',
      title: '주름·처짐',
      description: '나이 들어 보이는 주름과 처진 피부 개선',
      image: '/images/home/qe-concern-wrinkle.png',
      linkUrl: '/treatments?category=lifting',
    },
    {
      id: 'c2',
      title: '색소·잡티',
      description: '기미, 주근깨 등 고르지 못한 피부톤 해결',
      image: '/images/home/qe-concern-pigment.png',
      linkUrl: '/treatments?category=toning',
    },
    {
      id: 'c3',
      title: '모공·피부결',
      description: '넓은 모공과 거친 피부결 매끈하게',
      image: '/images/home/qe-concern-pore.png',
      linkUrl: '/treatments/sylfirm-x',
    },
    {
      id: 'c4',
      title: '볼륨·윤곽',
      description: '꺼진 볼륨과 윤곽선을 자연스럽게 회복',
      image: '/images/home/qe-concern-volume.png',
      linkUrl: '/treatments?category=botox-filler',
    },
  ],
  situation: [
    {
      id: 's1',
      title: '특별한 날 준비',
      description: '웨딩 D-day를 위한 맞춤 피부 관리 플랜',
      image: '/images/home/qe-situation-special.png',
      linkUrl: '/treatments?category=skincare',
    },
    {
      id: 's2',
      title: '정기 관리',
      description: '지속적인 피부 컨디션 유지 관리',
      image: '/images/home/qe-situation-regular.png',
      linkUrl: '/treatments?category=skincare',
    },
    {
      id: 's3',
      title: '빠른 시술',
      description: '바쁜 일정 속 빠르게 효과를 보는 시술',
      image: '/images/home/qe-situation-quick.png',
      linkUrl: '/treatments/ldm',
    },
    {
      id: 's4',
      title: '처음 방문',
      description: '피부과가 처음이신 분을 위한 가이드',
      image: '/images/home/qe-situation-first.png',
      linkUrl: '/treatments?category=skincare',
    },
  ],
};

// Fallback images by card ID pattern
const fallbackImageMap: Record<string, string> = {
  'qec-treatment-1': '/images/home/qe-lifting.png',
  'qec-treatment-2': '/images/home/qe-skincare.png',
  'qec-treatment-3': '/images/home/qe-toning.png',
  'qec-treatment-4': '/images/home/qe-botox.jpg',
  'qec-concern-1': '/images/home/qe-concern-wrinkle.png',
  'qec-concern-2': '/images/home/qe-concern-pigment.png',
  'qec-concern-3': '/images/home/qe-concern-pore.png',
  'qec-concern-4': '/images/home/qe-concern-volume.png',
  'qec-situation-1': '/images/home/qe-situation-special.png',
  'qec-situation-2': '/images/home/qe-situation-regular.png',
  'qec-situation-3': '/images/home/qe-situation-quick.png',
  'qec-situation-4': '/images/home/qe-situation-first.png',
};

function mapToPageShape(
  data: SanityQuickEntryCard[],
  _locale: string,
): QuickEntryCard[] {
  return data.map((card) => ({
    id: card._id,
    title: card.title || '',
    description: card.description || '',
    image: fallbackImageMap[card._id] || '/images/home/qe-lifting.png',
    linkUrl: card.linkUrl || '/treatments',
  }));
}

export async function getQuickEntryCards(
  tab: string,
  locale: string,
): Promise<QuickEntryCard[]> {
  const data = await sanityFetch<SanityQuickEntryCard[]>(quickEntryCardsQuery, {
    tab,
    locale,
  });

  if (data && data.length > 0) return mapToPageShape(data, locale);
  return fallbackCards[tab] || [];
}
