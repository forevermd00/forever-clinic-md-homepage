import { sanityFetch } from '@/lib/sanity/fetch';
import {
  clinicInfoQuery,
  facilitiesQuery,
  equipmentQuery,
} from '@/lib/sanity/queries';
import type { ClinicInfo } from '@/components/brand/LocationInfo';

/* ─── Types ─── */

export type GalleryItem = {
  id: string;
  name?: string;
  image?: { src: string; alt: string };
};

export type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  treatments: string;
};

/* ─── Fallback Data ─── */

const FALLBACK_CLINIC_INFO: ClinicInfo = {
  address: '서울특별시 중구 명동길 14, 포에버빌딩 3층',
  subway: '4호선 명동역 6번 출구 도보 3분',
  hours: '월~금 10:00-19:00 / 토 10:00-16:00 (일·공휴일 휴진)',
  phone: '02-XXX-XXXX',
};

const FALLBACK_FACILITIES: GalleryItem[] = [
  { id: 'f1', name: '대기실' },
  { id: 'f2', name: '상담실' },
  { id: 'f3', name: '시술실 1' },
  { id: 'f4', name: '시술실 2' },
  { id: 'f5', name: '리커버리룸' },
  { id: 'f6', name: '파우더룸' },
];

const FALLBACK_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'e1',
    name: '울쎄라',
    description:
      'FDA 승인 고밀도 초음파(MFU) 리프팅 장비. SMAS 근막층까지 에너지를 전달하여 자연스러운 리프팅 효과를 제공합니다.',
    treatments: '울쎄라 리프팅',
  },
  {
    id: 'e2',
    name: '써마지 FLX',
    description:
      '4세대 RF 에너지 기반 피부 타이트닝 장비. 콜라겐 재생을 촉진하여 즉각적인 리프팅과 점진적 개선 효과를 동시에 제공합니다.',
    treatments: '써마지 FLX',
  },
  {
    id: 'e3',
    name: '피코슈어',
    description:
      '755nm 피코초 레이저. 기미, 색소, 문신 제거에 탁월하며 피부 재생 효과까지 기대할 수 있습니다.',
    treatments: '피코토닝, 색소 치료',
  },
  {
    id: 'e4',
    name: '인모드',
    description:
      'RF와 마이크로 니들을 결합한 복합 리프팅 장비. 피부 표면과 깊은 층을 동시에 개선합니다.',
    treatments: '인모드 리프팅',
  },
  {
    id: 'e5',
    name: 'LDM',
    description:
      '초음파 피부 관리 장비. 듀얼 주파수로 피부 재생과 보습 효과를 극대화합니다.',
    treatments: 'LDM 관리',
  },
  {
    id: 'e6',
    name: '아쿠아필',
    description:
      '수소수 기반 필링 장비. 피부 딥클렌징과 수분 공급을 동시에 진행합니다.',
    treatments: '아쿠아필 관리',
  },
];

/* ─── Fetch Functions ─── */

export async function getClinicInfo(locale: string): Promise<ClinicInfo> {
  const data = await sanityFetch<ClinicInfo>(
    clinicInfoQuery,
    { locale },
    FALLBACK_CLINIC_INFO,
  );
  return data ?? FALLBACK_CLINIC_INFO;
}

export async function getFacilities(locale: string): Promise<GalleryItem[]> {
  const data = await sanityFetch<GalleryItem[]>(
    facilitiesQuery,
    { locale },
    FALLBACK_FACILITIES,
  );
  return data ?? FALLBACK_FACILITIES;
}

export async function getEquipment(locale: string): Promise<EquipmentItem[]> {
  const data = await sanityFetch<EquipmentItem[]>(
    equipmentQuery,
    { locale },
    FALLBACK_EQUIPMENT,
  );
  return data ?? FALLBACK_EQUIPMENT;
}
