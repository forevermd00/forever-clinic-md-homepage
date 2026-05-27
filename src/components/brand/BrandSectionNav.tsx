'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FilterTabs } from '@/components/common/FilterTabs';
import type { SectionVisibility } from '@/lib/data/visibility';

const DEFAULT_SECTION_IDS = [
  'philosophy',
  'doctors',
  'facilities',
  'equipment',
  'location',
  'stats',
] as const;

type SectionId = (typeof DEFAULT_SECTION_IDS)[number];

const SECTION_KEYS: Record<SectionId, string> = {
  philosophy: 'sectionPhilosophy',
  doctors: 'sectionDoctors',
  facilities: 'sectionFacilities',
  equipment: 'sectionEquipment',
  location: 'sectionLocation',
  stats: 'sectionStats',
};

interface BrandSectionNavProps {
  brandVisibility: SectionVisibility['brand'];
  brandOrder?: string[] | null;
}

export function BrandSectionNav({
  brandVisibility,
  brandOrder,
}: BrandSectionNavProps) {
  const t = useTranslations('brand');

  const orderedIds: SectionId[] = brandOrder?.length
    ? [
        ...brandOrder.filter((k): k is SectionId =>
          DEFAULT_SECTION_IDS.includes(k as SectionId),
        ),
        ...DEFAULT_SECTION_IDS.filter((k) => !brandOrder.includes(k)),
      ]
    : [...DEFAULT_SECTION_IDS];

  const visibleSections = orderedIds.filter(
    (id) => brandVisibility[id] !== false,
  );

  const [activeTab, setActiveTab] = useState<SectionId>(
    visibleSections[0] ?? 'philosophy',
  );

  const tabs = visibleSections.map((id) => ({
    id,
    label: t(SECTION_KEYS[id]),
  }));

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id as SectionId);
    const el = document.getElementById(id);
    if (el) {
      const offset = 116; // header(64px) + tab bar(48px) + 4px breathing room
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id as SectionId);
          }
        }
      },
      { rootMargin: '-130px 0px -60% 0px', threshold: 0 },
    );

    for (const id of visibleSections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSections.join(',')]);

  if (tabs.length === 0) return null;

  return (
    <nav className="sticky top-16 z-20 border-b border-[#e8ded6] bg-white/92 backdrop-blur-sm">
      <div className="mx-auto max-w-[var(--container-max)]">
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          variant="anchor"
          className="!bg-transparent !shadow-none"
        />
      </div>
    </nav>
  );
}
