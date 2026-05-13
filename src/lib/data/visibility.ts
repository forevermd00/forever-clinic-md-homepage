import { sanityFetch } from '@/lib/sanity/fetch';

export interface SectionVisibility {
  nav: {
    bnA: boolean;
    treatments: boolean;
    brand: boolean;
    media: boolean;
  };
  home: {
    hero: boolean;
    quickEntry: boolean;
    signature: boolean;
    promo: boolean;
    bnA: boolean;
    stats: boolean;
    doctors: boolean;
    location: boolean;
    contact: boolean;
  };
  brand: {
    philosophy: boolean;
    doctors: boolean;
    facilities: boolean;
    equipment: boolean;
    location: boolean;
  };
  media: {
    press: boolean;
    blog: boolean;
    notice: boolean;
    video: boolean;
  };
}

export const DEFAULT_VISIBILITY: SectionVisibility = {
  nav: { bnA: true, treatments: true, brand: true, media: true },
  home: {
    hero: true,
    quickEntry: true,
    signature: true,
    promo: true,
    bnA: true,
    stats: true,
    doctors: true,
    location: true,
    contact: true,
  },
  brand: {
    philosophy: true,
    doctors: true,
    facilities: true,
    equipment: true,
    location: true,
  },
  media: { press: true, blog: true, notice: true, video: true },
};

const QUERY = `*[_type == "sectionVisibility" && _id == "sectionVisibility"][0]{
  nav,
  home,
  brand,
  media
}`;

type RawVisibility = {
  nav?: Partial<SectionVisibility['nav']> | null;
  home?: Partial<SectionVisibility['home']> | null;
  brand?: Partial<SectionVisibility['brand']> | null;
  media?: Partial<SectionVisibility['media']> | null;
};

export async function getSectionVisibility(): Promise<SectionVisibility> {
  const raw = await sanityFetch<RawVisibility>(QUERY, {});

  if (!raw) {
    return DEFAULT_VISIBILITY;
  }

  return {
    nav: {
      bnA: raw.nav?.bnA ?? true,
      treatments: raw.nav?.treatments ?? true,
      brand: raw.nav?.brand ?? true,
      media: raw.nav?.media ?? true,
    },
    home: {
      hero: raw.home?.hero ?? true,
      quickEntry: raw.home?.quickEntry ?? true,
      signature: raw.home?.signature ?? true,
      promo: raw.home?.promo ?? true,
      bnA: raw.home?.bnA ?? true,
      stats: raw.home?.stats ?? true,
      doctors: raw.home?.doctors ?? true,
      location: raw.home?.location ?? true,
      contact: raw.home?.contact ?? true,
    },
    brand: {
      philosophy: raw.brand?.philosophy ?? true,
      doctors: raw.brand?.doctors ?? true,
      facilities: raw.brand?.facilities ?? true,
      equipment: raw.brand?.equipment ?? true,
      location: raw.brand?.location ?? true,
    },
    media: {
      press: raw.media?.press ?? true,
      blog: raw.media?.blog ?? true,
      notice: raw.media?.notice ?? true,
      video: raw.media?.video ?? true,
    },
  };
}
