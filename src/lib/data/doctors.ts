import { sanityFetch } from '@/lib/sanity/fetch';
import { doctorsQuery } from '@/lib/sanity/queries';
import type { Doctor } from '@/components/brand/DoctorCard';

const FALLBACK_DOCTORS: Doctor[] = [
  {
    name: '김포에버 원장',
    specialty: '리프팅 · 피부케어 전문',
    bio: '서울대 의과대학 졸업, 대한피부과학회 정회원. 15년간 리프팅 시술 경험으로 자연스러운 결과를 추구합니다.',
  },
  {
    name: '이명동 원장',
    specialty: '레이저 · 토닝 전문',
    bio: '연세대 의과대학 졸업, 미국 피부과학회 정회원. 최신 레이저 장비를 활용한 맞춤형 피부 치료를 제공합니다.',
  },
  {
    name: '박프리미엄 원장',
    specialty: '보톡스 · 필러 전문',
    bio: '고려대 의과대학 졸업, 대한미용성형외과학회 정회원. 정밀한 주사 기법으로 자연스러운 볼륨감을 완성합니다.',
  },
  {
    name: '최케어 원장',
    specialty: '스킨케어 · 재생 전문',
    bio: '성균관대 의과대학 졸업, 대한피부과학회 정회원. 피부 장벽 회복과 근본적 피부 건강 개선에 집중합니다.',
  },
];

export async function getDoctors(locale: string): Promise<Doctor[]> {
  const data = await sanityFetch<Doctor[]>(
    doctorsQuery,
    { locale },
    FALLBACK_DOCTORS,
  );
  return data ?? FALLBACK_DOCTORS;
}
