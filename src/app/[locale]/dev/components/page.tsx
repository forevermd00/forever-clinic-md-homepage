'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Divider } from '@/components/ui/Divider';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Spinner } from '@/components/ui/Spinner';

import { BaseCard } from '@/components/common/BaseCard';
import { CardGrid } from '@/components/common/CardGrid';
import { HeroBanner } from '@/components/common/HeroBanner';
import { SectionLayout } from '@/components/common/SectionLayout';
import { CTABanner } from '@/components/common/CTABanner';
import { FilterTabs } from '@/components/common/FilterTabs';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

/* ================================================================
   Section wrapper for the showcase page
   ================================================================ */
function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-neutral-200 py-12">
      <h2 className="text-forever-charcoal mb-8 text-[24px] font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* ================================================================
   Toast demo helper (needs to be inside ToastProvider)
   ================================================================ */
function ToastDemo() {
  const { addToast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="sm"
        onClick={() =>
          addToast({
            variant: 'success',
            message: '장바구니에 추가되었습니다.',
          })
        }
      >
        Success Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          addToast({ variant: 'error', message: '오류가 발생했습니다.' })
        }
      >
        Error Toast
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          addToast({
            variant: 'info',
            message: '새로운 프로모션이 등록되었습니다.',
            action: { label: '보기', onClick: () => {} },
          })
        }
      >
        Info Toast + Action
      </Button>
    </div>
  );
}

/* ================================================================
   Main page
   ================================================================ */
export default function ComponentsShowcase() {
  const [activeTab, setActiveTab] = useState('treatment');
  const [modalOpen, setModalOpen] = useState(false);

  const sampleTabs = [
    { id: 'treatment', label: '시술로 찾기' },
    { id: 'concern', label: '고민으로 찾기' },
    { id: 'situation', label: '상황으로 찾기' },
  ];

  return (
    <ToastProvider>
      <div className="bg-forever-ivory min-h-screen">
        {/* Page Header */}
        <div className="border-b border-neutral-200 bg-white px-6 py-6 lg:px-12">
          <h1 className="text-forever-charcoal text-[32px] font-bold">
            Forever Clinic Design System
          </h1>
          <p className="mt-2 text-neutral-500">
            W1 Component Showcase — Figma 디자인 검토용
          </p>
        </div>

        <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
          {/* ================================================
              1. COLORS
              ================================================ */}
          <ShowcaseSection title="1. Color Palette">
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[13px] font-semibold text-neutral-600">
                  Core Palette
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Ivory', cls: 'bg-forever-ivory', hex: '#FAF8F5' },
                    { name: 'Beige', cls: 'bg-forever-beige', hex: '#EFE5D9' },
                    { name: 'Taupe', cls: 'bg-forever-taupe', hex: '#D4C8BD' },
                    {
                      name: 'Charcoal',
                      cls: 'bg-forever-charcoal',
                      hex: '#2B2B2B',
                    },
                    { name: 'Red', cls: 'bg-forever-red', hex: '#A83C44' },
                  ].map((c) => (
                    <div key={c.name} className="w-[120px]">
                      <div
                        className={`${c.cls} h-[80px] rounded-[var(--radius-card)] border border-neutral-200`}
                      />
                      <p className="mt-2 text-[13px] font-semibold">{c.name}</p>
                      <p className="text-[11px] text-neutral-500">{c.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[13px] font-semibold text-neutral-600">
                  Neutral Scale
                </p>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                    (n) => (
                      <div key={n} className="w-[80px]">
                        <div
                          className={`bg-neutral-${n} h-[48px] rounded-lg border border-neutral-200`}
                        />
                        <p className="mt-1 text-center text-[11px] text-neutral-500">
                          {n}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              2. BUTTONS
              ================================================ */}
          <ShowcaseSection title="2. Button">
            <div className="space-y-6">
              {(['primary', 'secondary', 'ghost', 'text'] as const).map(
                (variant) => (
                  <div key={variant}>
                    <p className="mb-3 text-[13px] font-semibold text-neutral-600 capitalize">
                      {variant}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant={variant} size="sm">
                        Small
                      </Button>
                      <Button variant={variant} size="md">
                        Medium
                      </Button>
                      <Button variant={variant} size="lg">
                        Large
                      </Button>
                      <Button variant={variant} size="md" disabled>
                        Disabled
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </ShowcaseSection>

          {/* ================================================
              3. BADGES
              ================================================ */}
          <ShowcaseSection title="3. Badge">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="red" size="sm">
                  이벤트
                </Badge>
                <Badge variant="red" size="md">
                  이벤트
                </Badge>
                <Badge variant="beige" size="sm">
                  리프팅
                </Badge>
                <Badge variant="beige" size="md">
                  리프팅
                </Badge>
                <Badge variant="taupe" size="sm">
                  스킨케어
                </Badge>
                <Badge variant="taupe" size="md">
                  스킨케어
                </Badge>
                <Badge variant="outline" size="sm">
                  NEW
                </Badge>
                <Badge variant="outline" size="md">
                  NEW
                </Badge>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              4. INPUT / TEXTAREA
              ================================================ */}
          <ShowcaseSection title="4. Input & Textarea">
            <div className="grid max-w-[720px] grid-cols-1 gap-6 md:grid-cols-2">
              <Input label="이름" placeholder="이름을 입력해주세요" />
              <Input
                label="이메일"
                placeholder="email@example.com"
                error="유효한 이메일을 입력해주세요"
              />
              <Input
                label="전화번호"
                placeholder="010-0000-0000"
                helperText="하이픈(-) 포함 입력"
              />
              <Input
                label="비밀번호"
                type="password"
                placeholder="비밀번호"
                disabled
              />
            </div>
            <div className="mt-6 max-w-[720px]">
              <Textarea
                label="상담 내용"
                placeholder="내용을 입력해주세요..."
                rows={4}
              />
            </div>
          </ShowcaseSection>

          {/* ================================================
              5. SECTION TITLE
              ================================================ */}
          <ShowcaseSection title="5. Section Title">
            <div className="space-y-8">
              <SectionTitle
                as="h1"
                subtitle="섹션에 대한 간단한 설명이 여기에 표시됩니다."
              >
                H1 섹션 타이틀
              </SectionTitle>
              <SectionTitle
                as="h2"
                align="center"
                subtitle="중앙 정렬 서브타이틀"
              >
                H2 Center 타이틀
              </SectionTitle>
              <SectionTitle as="h3">H3 Without Subtitle</SectionTitle>
            </div>
          </ShowcaseSection>

          {/* ================================================
              6. DIVIDER
              ================================================ */}
          <ShowcaseSection title="6. Divider">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-[13px] text-neutral-500">Line</p>
                <Divider variant="line" />
              </div>
              <div>
                <p className="mb-2 text-[13px] text-neutral-500">Dot</p>
                <Divider variant="dot" />
              </div>
              <div>
                <p className="mb-2 text-[13px] text-neutral-500">
                  Space (40px)
                </p>
                <div className="bg-neutral-100">
                  <Divider variant="space" />
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              7. AVATAR
              ================================================ */}
          <ShowcaseSection title="7. Avatar">
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Circle</p>
                <div className="flex items-end gap-4">
                  <Avatar shape="circle" size="sm" initial="K" />
                  <Avatar shape="circle" size="md" initial="F" />
                  <Avatar shape="circle" size="lg" initial="C" />
                  <Avatar shape="circle" size="xl" initial="D" />
                </div>
              </div>
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Square</p>
                <div className="flex items-end gap-4">
                  <Avatar shape="square" size="sm" initial="K" />
                  <Avatar shape="square" size="md" initial="F" />
                  <Avatar shape="square" size="lg" initial="C" />
                  <Avatar shape="square" size="xl" initial="D" />
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              8. SKELETON & SPINNER
              ================================================ */}
          <ShowcaseSection title="8. Skeleton & Spinner">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Skeleton</p>
                <div className="flex items-center gap-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="space-y-2">
                    <Skeleton variant="text" width={200} height={16} />
                    <Skeleton variant="text" width={140} height={14} />
                  </div>
                </div>
                <Skeleton
                  variant="rectangular"
                  width={320}
                  height={120}
                  className="mt-3"
                />
              </div>
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Spinner</p>
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              9. FILTER TABS
              ================================================ */}
          <ShowcaseSection title="9. Filter Tabs">
            <div className="space-y-8">
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Pill</p>
                <FilterTabs
                  tabs={sampleTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  variant="pill"
                />
              </div>
              <div>
                <p className="mb-3 text-[13px] text-neutral-500">Underline</p>
                <FilterTabs
                  tabs={sampleTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  variant="underline"
                />
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              10. CARDS
              ================================================ */}
          <ShowcaseSection title="10. BaseCard + CardGrid">
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-[13px] font-semibold text-neutral-600">
                  Treatment Cards (Default)
                </p>
                <CardGrid
                  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                  gap="md"
                >
                  <BaseCard
                    variant="treatment"
                    title="울쎄라 리프팅"
                    description="처진 피부의 근본적인 탄력 회복"
                  />
                  <BaseCard
                    variant="treatment"
                    title="스킨 부스터"
                    description="피부 깊숙이 수분과 영양을 공급"
                    badge={
                      <Badge variant="red" size="sm">
                        이벤트
                      </Badge>
                    }
                  />
                  <BaseCard
                    variant="treatment"
                    title="보톡스 시술"
                    description="자연스러운 주름 개선과 윤곽 교정"
                  />
                </CardGrid>
              </div>
              <div>
                <p className="mb-4 text-[13px] font-semibold text-neutral-600">
                  Compact Cards
                </p>
                <CardGrid
                  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                  gap="sm"
                >
                  <BaseCard
                    variant="treatment"
                    size="compact"
                    title="리프팅"
                    description="탄력 회복"
                  />
                  <BaseCard
                    variant="info"
                    size="compact"
                    title="진료 시간"
                    description="월-금 10:00-19:00"
                  />
                  <BaseCard
                    variant="stat"
                    size="compact"
                    title="15,000+"
                    description="누적 시술 건수"
                  />
                  <BaseCard
                    variant="testimonial"
                    size="compact"
                    title='"자연스러운 결과에 만족합니다."'
                    description="김** 고객님"
                  />
                </CardGrid>
              </div>
              <div>
                <p className="mb-4 text-[13px] font-semibold text-neutral-600">
                  Default Info / Stat / Testimonial
                </p>
                <CardGrid
                  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                  gap="md"
                >
                  <BaseCard
                    variant="info"
                    title="오시는 길"
                    description="서울특별시 중구 명동길 74 5층 (명동역 6번 출구 도보 2분)"
                  />
                  <BaseCard
                    variant="stat"
                    title="15,000+"
                    description="누적 시술 건수"
                  />
                  <BaseCard
                    variant="testimonial"
                    title='"상담부터 시술까지 세심하게 케어해주셨어요."'
                    description="박** 고객님"
                  />
                </CardGrid>
              </div>
            </div>
          </ShowcaseSection>

          {/* ================================================
              11. PAGINATION
              ================================================ */}
          <ShowcaseSection title="11. Pagination">
            <Pagination
              currentPage={3}
              totalPages={12}
              basePath="/dev/components"
            />
          </ShowcaseSection>

          {/* ================================================
              12. MODAL
              ================================================ */}
          <ShowcaseSection title="12. Modal">
            <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
            <Modal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="예약 확인"
            >
              <p className="text-neutral-600">
                울쎄라 리프팅 1회를 예약하시겠습니까?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  취소
                </Button>
                <Button size="sm" onClick={() => setModalOpen(false)}>
                  확인
                </Button>
              </div>
            </Modal>
          </ShowcaseSection>

          {/* ================================================
              13. TOAST
              ================================================ */}
          <ShowcaseSection title="13. Toast">
            <ToastDemo />
          </ShowcaseSection>

          {/* ================================================
              14. DISCLAIMER BANNER
              ================================================ */}
          <ShowcaseSection title="14. Disclaimer Banner">
            <div className="space-y-4">
              <DisclaimerBanner variant="inline">
                개인의 시술 결과는 개인에 따라 차이가 있을 수 있습니다. 정확한
                상담은 전문의와 진행해주세요.
              </DisclaimerBanner>
            </div>
          </ShowcaseSection>
        </div>

        {/* ================================================
            15. HERO BANNER (full-width)
            ================================================ */}
        <div className="mt-12">
          <h2 className="text-forever-charcoal mb-4 px-6 text-[24px] font-bold lg:px-12">
            15. Hero Banner
          </h2>
          <div className="space-y-4">
            <HeroBanner
              variant="fullscreen"
              title="보여주기식 럭셔리가 아니라, 정교하게 설계된 신뢰의 프리미엄"
              subtitle="Smart-Boutique Aesthetic Clinic in Myeongdong"
              ctaText="무료 상담 예약"
              ctaHref="#"
            />
            <HeroBanner variant="page-title" title="Before & After" />
          </div>
        </div>

        {/* ================================================
            16. SECTION LAYOUT (full-width)
            ================================================ */}
        <div className="mt-12">
          <h2 className="text-forever-charcoal mb-4 px-6 text-[24px] font-bold lg:px-12">
            16. Section Layout
          </h2>
          <SectionLayout
            label="프로모션"
            title="이달의 프로모션"
            subtitle="놓치면 아쉬운 시술 이벤트"
            background="ivory"
            padding="lg"
          >
            <CardGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
              <BaseCard
                variant="treatment"
                title="프로모션 1"
                description="이벤트가 ₩000,000"
                badge={
                  <Badge variant="red" size="sm">
                    EVENT
                  </Badge>
                }
              />
              <BaseCard
                variant="treatment"
                title="프로모션 2"
                description="이벤트가 ₩000,000"
                badge={
                  <Badge variant="red" size="sm">
                    EVENT
                  </Badge>
                }
              />
              <BaseCard
                variant="treatment"
                title="프로모션 3"
                description="이벤트가 ₩000,000"
                badge={
                  <Badge variant="red" size="sm">
                    EVENT
                  </Badge>
                }
              />
            </CardGrid>
          </SectionLayout>
        </div>

        {/* ================================================
            17. CTA BANNER (full-width)
            ================================================ */}
        <div className="mt-12">
          <h2 className="text-forever-charcoal mb-4 px-6 text-[24px] font-bold lg:px-12">
            17. CTA Banner
          </h2>
          <CTABanner
            variant="default"
            title="지금 무료 상담을 받아보세요"
            description="전문 상담사가 맞춤 시술 플랜을 제안해 드립니다."
            ctaText="상담 예약하기"
            ctaHref="#"
          />
          <CTABanner
            variant="highlight"
            title="Smart-Boutique 포에버 의원"
            description="정직, 정교, 전문, 존엄 — 신뢰의 프리미엄"
            ctaText="브랜드 소개"
            ctaHref="#"
          />
        </div>

        {/* Footer spacer */}
        <div className="h-24" />
      </div>
    </ToastProvider>
  );
}
