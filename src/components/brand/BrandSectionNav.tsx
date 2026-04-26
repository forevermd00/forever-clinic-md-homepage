'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FilterTabs } from '@/components/common/FilterTabs';

const SECTION_IDS = [
  'philosophy',
  'doctors',
  'facilities',
  'equipment',
  'location',
] as const;

const SECTION_KEYS: Record<string, string> = {
  philosophy: 'sectionPhilosophy',
  doctors: 'sectionDoctors',
  facilities: 'sectionFacilities',
  equipment: 'sectionEquipment',
  location: 'sectionLocation',
};

export function BrandSectionNav() {
  const t = useTranslations('brand');
  const [activeTab, setActiveTab] = useState('philosophy');

  const tabs = SECTION_IDS.map((id) => ({
    id,
    label: t(SECTION_KEYS[id]),
  }));

  const handleTabChange = useCallback((id: string) => {
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
            setActiveTab(entry.target.id);
          }
        }
      },
      { rootMargin: '-130px 0px -60% 0px', threshold: 0 },
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

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
