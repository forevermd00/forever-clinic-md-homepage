import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { DoctorCard, type Doctor } from '@/components/brand/DoctorCard';
import { GalleryCarousel } from '@/components/brand/GalleryCarousel';
import { EquipmentShowcase } from '@/components/brand/EquipmentShowcase';

type GalleryItem = {
  id: string;
  name?: string;
  image?: { src: string; alt: string };
};
import { LocationInfo, type ClinicInfo } from '@/components/brand/LocationInfo';
import { BrandSectionNav } from '@/components/brand/BrandSectionNav';

/* ─── Dummy Data (Sanity schema: doctor) ─── */
const DUMMY_DOCTORS: Doctor[] = [
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

/* ─── Dummy Data (Sanity schema: facility) ─── */
const DUMMY_FACILITIES: GalleryItem[] = [
  { id: 'f1', name: '대기실' },
  { id: 'f2', name: '상담실' },
  { id: 'f3', name: '시술실 1' },
  { id: 'f4', name: '시술실 2' },
  { id: 'f5', name: '리커버리룸' },
  { id: 'f6', name: '파우더룸' },
];

/* ─── Dummy Data (Sanity schema: equipment) ─── */
const DUMMY_EQUIPMENT = [
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

/* ─── Dummy Data (Sanity schema: clinicInfo) ─── */
const DUMMY_CLINIC_INFO: ClinicInfo = {
  address: '서울특별시 중구 명동길 14, 포에버빌딩 3층',
  subway: '4호선 명동역 6번 출구 도보 3분',
  hours: '월~금 10:00-19:00 / 토 10:00-16:00 (일·공휴일 휴진)',
  phone: '02-XXX-XXXX',
};

export default async function BrandPage() {
  const t = await getTranslations('brand');
  const th = await getTranslations('home');

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="fullscreen"
        title={th('heroTitle')}
        subtitle={th('heroSubtitle')}
        imageSrc="/images/heroes/brand-hero.png"
        className="!h-[280px] !max-h-[280px]"
      />

      {/* Section Tabs (sticky) — client component */}
      <BrandSectionNav />

      {/* Philosophy Section */}
      <section id="philosophy" className="scroll-mt-[120px] bg-[#faf8f5]">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-3 px-4 pt-16 pb-8 lg:pt-20 lg:pb-12">
          <span className="text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
            BRAND PHILOSOPHY
          </span>
          <h2 className="text-[28px] font-bold text-[#2b2b2b]">
            {t('smartBoutiquePhilosophy')}
          </h2>
          <p className="text-center text-[14px] text-[#706263]">
            {t('philosophyDescription')}
          </p>
        </div>

        {/* Value 1: Honesty — text left, image right */}
        <div className="bg-white">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('honesty')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('honestyDescDesktop')}
              </p>
            </div>
            <img
              src="/images/brand/philosophy-honesty.png"
              alt={t('honesty')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-honesty.png"
              alt={t('honesty')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('honesty')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('honestyDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 2: Precision — image left, text right */}
        <div className="bg-[#f9f6f3]">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <img
              src="/images/brand/philosophy-precision.png"
              alt={t('precision')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('precision')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('precisionDescDesktop')}
              </p>
            </div>
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-precision.png"
              alt={t('precision')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('precision')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('precisionDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 3: Expertise — text left, image right */}
        <div className="bg-white">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('expertise')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('expertiseDescDesktop')}
              </p>
            </div>
            <img
              src="/images/brand/philosophy-expertise.png"
              alt={t('expertise')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-expertise.png"
              alt={t('expertise')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('expertise')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('expertiseDesc')}</p>
            </div>
          </div>
        </div>

        {/* Value 4: Dignity — image left, text right */}
        <div className="bg-[#f9f6f3]">
          <div className="mx-auto hidden max-w-[1440px] items-center justify-center gap-[60px] px-[100px] py-[60px] lg:flex">
            <img
              src="/images/brand/philosophy-dignity.png"
              alt={t('dignity')}
              className="h-[400px] w-[620px] shrink-0 rounded-[8px] object-cover"
            />
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-bold text-[#2b2b2b]">
                {t('dignity')}
              </p>
              <p className="text-[14px] whitespace-pre-line text-[#706263]">
                {t('dignityDescDesktop')}
              </p>
            </div>
          </div>
          <div className="flex flex-col pb-4 lg:hidden">
            <img
              src="/images/brand/philosophy-dignity.png"
              alt={t('dignity')}
              className="h-[220px] w-full object-cover"
            />
            <div className="flex flex-col gap-2 px-5 pt-4">
              <p className="text-[20px] font-bold text-[#2b2b2b]">
                {t('dignity')}
              </p>
              <p className="text-[12px] text-[#706263]">{t('dignityDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section
        id="doctors"
        className="scroll-mt-[120px] bg-[#faf8f5] px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] tracking-wider text-[#d4c8bd]">
              OUR DOCTORS
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('doctors')}
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {DUMMY_DOCTORS.map((doctor) => (
              <DoctorCard key={doctor.name} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* Facility Gallery */}
      <section
        id="facilities"
        className="scroll-mt-[120px] bg-white px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              FACILITIES
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('facilityGallery')}
            </h2>
          </div>
          <GalleryCarousel items={DUMMY_FACILITIES} />
        </div>
      </section>

      {/* Equipment Gallery */}
      <section
        id="equipment"
        className="scroll-mt-[120px] bg-[#faf8f5] px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              EQUIPMENT
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('equipment')}
            </h2>
          </div>
          <EquipmentShowcase items={DUMMY_EQUIPMENT} />
        </div>
      </section>

      {/* Location Section */}
      <section
        id="location"
        className="scroll-mt-[120px] bg-white px-4 py-20 md:px-6 lg:px-12"
      >
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[12px] font-medium tracking-[2px] text-[#d4c8bd]">
              LOCATION
            </span>
            <h2 className="text-[28px] font-bold text-[#2b2b2b]">
              {t('location')}
            </h2>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Map placeholder */}
            <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-[12px] bg-[#efe5d9]">
              <span className="text-[13px] text-[#808080]">{t('mapArea')}</span>
            </div>
            {/* Clinic Info */}
            <div className="flex-1">
              <LocationInfo clinicInfo={DUMMY_CLINIC_INFO} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
