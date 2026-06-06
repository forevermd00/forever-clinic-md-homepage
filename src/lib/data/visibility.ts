import { sanityFetch } from '@/lib/sanity/fetch';

export interface SectionVisibility {
  nav: {
    bnA: boolean;
    treatments: boolean;
    brand: boolean;
    media: boolean;
    catLiftingLaser: boolean;
    catPetitLifting: boolean;
    catSkincare: boolean;
    catSkinBooster: boolean;
    catHairRemoval: boolean;
    catAnesthesia: boolean;
  };
  home: {
    hero: boolean;
    quickEntry: boolean;
    signature: boolean;
    promo: boolean;
    bnA: boolean;
    press: boolean;
    stats: boolean;
    brandPhilosophy: boolean;
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
    stats: boolean;
  };
  media: {
    press: boolean;
    blog: boolean;
    notice: boolean;
    video: boolean;
  };
  treatments: {
    detail: boolean;
    showPrice: boolean;
  };
  navOrder?: string[] | null;
  megaMenuOrder?: string[] | null;
  homeOrder?: string[] | null;
  brandOrder?: string[] | null;
  mediaOrder?: string[] | null;
}

export const DEFAULT_VISIBILITY: SectionVisibility = {
  nav: {
    bnA: true,
    treatments: true,
    brand: true,
    media: true,
    catLiftingLaser: true,
    catPetitLifting: true,
    catSkincare: true,
    catSkinBooster: true,
    catHairRemoval: true,
    catAnesthesia: true,
  },
  home: {
    hero: true,
    quickEntry: true,
    signature: true,
    promo: true,
    bnA: true,
    press: true,
    stats: true,
    brandPhilosophy: true,
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
    stats: true,
  },
  media: { press: true, blog: true, notice: true, video: true },
  treatments: { detail: true, showPrice: true },
};

// Admin saves catXxx keys (catLiftingLaser), but consuming code uses slugs (lifting-laser)
const MEGA_MENU_KEY_TO_SLUG: Record<string, string> = {
  catLiftingLaser: 'lifting-laser',
  catPetitLifting: 'petit-lifting',
  catSkincare: 'skincare',
  catSkinBooster: 'skin-booster',
  catHairRemoval: 'hair-removal',
  catAnesthesia: 'anesthesia',
};

function normalizeMegaMenuOrder(
  order: string[] | null | undefined,
): string[] | null {
  if (!order?.length) return null;
  return order.map((k) => MEGA_MENU_KEY_TO_SLUG[k] ?? k);
}

const QUERY = `*[_type == "sectionVisibility" && _id == "sectionVisibility"][0]{
  nav,
  home,
  brand,
  media,
  treatments,
  navOrder,
  megaMenuOrder,
  homeOrder,
  brandOrder,
  mediaOrder
}`;

type RawVisibility = {
  nav?: Partial<SectionVisibility['nav']> | null;
  home?: Partial<SectionVisibility['home']> | null;
  brand?: Partial<SectionVisibility['brand']> | null;
  media?: Partial<SectionVisibility['media']> | null;
  treatments?: Partial<SectionVisibility['treatments']> | null;
  navOrder?: string[] | null;
  megaMenuOrder?: string[] | null;
  homeOrder?: string[] | null;
  brandOrder?: string[] | null;
  mediaOrder?: string[] | null;
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
      catLiftingLaser: raw.nav?.catLiftingLaser ?? true,
      catPetitLifting: raw.nav?.catPetitLifting ?? true,
      catSkincare: raw.nav?.catSkincare ?? true,
      catSkinBooster: raw.nav?.catSkinBooster ?? true,
      catHairRemoval: raw.nav?.catHairRemoval ?? true,
      catAnesthesia: raw.nav?.catAnesthesia ?? true,
    },
    home: {
      hero: raw.home?.hero ?? true,
      quickEntry: raw.home?.quickEntry ?? true,
      signature: raw.home?.signature ?? true,
      promo: raw.home?.promo ?? true,
      bnA: raw.home?.bnA ?? true,
      press: raw.home?.press ?? true,
      stats: raw.home?.stats ?? true,
      brandPhilosophy: raw.home?.brandPhilosophy ?? true,
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
      stats: raw.brand?.stats ?? true,
    },
    media: {
      press: raw.media?.press ?? true,
      blog: raw.media?.blog ?? true,
      notice: raw.media?.notice ?? true,
      video: raw.media?.video ?? true,
    },
    treatments: {
      detail: raw.treatments?.detail ?? true,
      showPrice: raw.treatments?.showPrice ?? true,
    },
    navOrder: raw.navOrder ?? null,
    megaMenuOrder: normalizeMegaMenuOrder(raw.megaMenuOrder),
    homeOrder: raw.homeOrder ?? null,
    brandOrder: raw.brandOrder ?? null,
    mediaOrder: raw.mediaOrder ?? null,
  };
}
