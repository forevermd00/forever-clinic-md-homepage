// === Signature Programs (treatment 타입, isSignature == true) ===
export const signatureProgramsQuery = `
  *[_type == "treatment" && isSignature == true && isVisible == true] | order(sortOrder asc) {
    _id,
    "slug": slug.current,
    "name": name[$locale],
    "keywords": keywords[$locale],
    "position": tagline[$locale],
    "originalPrice": priceOptions[0].price,
    "discountedPrice": coalesce(priceOptions[0].discountPrice, priceOptions[0].price),
    "discountRate": round((1 - coalesce(priceOptions[0].discountPrice, priceOptions[0].price) / priceOptions[0].price) * 100),
    category
  }
`;

export const signatureProgramBySlugQuery = `
  *[_type == "treatment" && slug.current == $slug && isSignature == true && isVisible == true][0] {
    _id,
    "slug": slug.current,
    "name": name[$locale],
    "keywords": keywords[$locale],
    "position": tagline[$locale],
    "description": description[$locale],
    "composition": composition[$locale],
    "originalPrice": priceOptions[0].price,
    "discountedPrice": coalesce(priceOptions[0].discountPrice, priceOptions[0].price),
    "discountRate": round((1 - coalesce(priceOptions[0].discountPrice, priceOptions[0].price) / priceOptions[0].price) * 100),
    category
  }
`;

// === Home Page ===
export const homeHeroQuery = `*[_type == "pageHero" && _id == "page-hero-main"][0]`;

export const homeQuickEntryQuery = `*[_type == "quickEntryCard" && isVisible == true] | order(sortOrder asc)`;

export const homePromoQuery = `*[_type == "promotion" && showOnMain == true] | order(sortOrder asc)[0...3]`;

export const homeEventTreatmentsQuery = `
  *[_type == "treatment" && isVisible == true && isEvent == true] | order(sortOrder asc)[0...3] {
    _id, name, "slug": slug.current, category, tagline, priceOptions, isEvent,
    "imageUrl": thumbnail.asset->url
  }
`;

export const homeBACasesQuery = `*[_type == "baCase" && showOnMain == true && isVisible == true] | order(_createdAt desc)[0...3] {
  _id, beforeImage, afterImage,
  "treatment": treatment-> { _id, "name": name[$locale], "slug": slug.current, category },
  "sessions": sessions[$locale], "elapsed": elapsed[$locale]
}`;

export const homeBrandQuery = `*[_type == "brandPhilosophy"][0]`;

export const homeStatsQuery = `*[_type == "statsStrip"][0]`;

export const homeDoctorsQuery = `*[_type == "doctor" && isVisible == true] | order(sortOrder asc)`;

export const homeClinicInfoQuery = `*[_type == "clinicInfo"][0]`;

export const homeEventPopupQuery = `*[_type == "eventPopup" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)][0]`;

// === Treatment ===
export const treatmentsByCategoryQuery = `*[_type == "treatment" && isVisible == true && category == $category] | order(sortOrder asc) {
  ..., "imageUrl": thumbnail.asset->url
}`;

export const allTreatmentsGroupedQuery = `*[_type == "treatment" && isVisible == true] | order(sortOrder asc) {
  _id, name, slug, category, tagline, keywords, description, composition, priceOptions, isEvent, isSignature, downtime, treatmentTime, duration,
  "imageUrl": thumbnail.asset->url
}`;

export const treatmentsByQuickEntryQuery = `
  *[_type == "quickEntryCard" && _id == $cardId][0].linkedTreatments[]-> {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, priceOptions, isEvent
  } | order(sortOrder asc)
`;

export const treatmentDetailQuery = `
  *[_type == "treatment" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    "name": name[$locale],
    "tagline": tagline[$locale],
    "keywords": keywords[$locale],
    "description": description[$locale],
    "composition": composition[$locale],
    category,
    isEvent,
    isSignature,
    isVisible,
    duration,
    downtime,
    treatmentTime,
    "imageUrl": thumbnail.asset->url,
    priceOptions[] { price, discountPrice },
    "effects": effects[][$locale],
    "features": features[][$locale],
    "recommendedFor": recommendedFor[][$locale],
    "procedure": procedure[][$locale],
    "precautions": precautions[][$locale],
    "faq": faq[] {
      "question": question[$locale],
      "answer": answer[$locale]
    },
    "relatedTreatments": relatedTreatments[]-> {
      _id,
      "slug": slug.current,
      "name": name[$locale],
      category,
      priceOptions[0] { price, discountPrice },
      isEvent
    }
  }
`;

export const allTreatmentsForCartQuery = `
  *[_type == "treatment" && isVisible == true] | order(sortOrder asc) {
    _id, "name": name[$locale], "slug": slug.current, category, priceOptions, isEvent
  }
`;

// === B&A ===
export const baCasesQuery = `*[_type == "baCase" && isVisible == true] | order(sortOrder asc)`;

export const baCasesFilteredQuery = `
  *[_type == "baCase" && isVisible == true
    && ($category == "all" || treatment->category == $category)
  ] | order(sortOrder asc) {
    _id, beforeImage, afterImage,
    "treatment": treatment-> { _id, "name": name[$locale], "slug": slug.current, category },
    "sessions": sessions[$locale], "elapsed": elapsed[$locale]
  }
`;

export const baCaseDetailQuery = `
  *[_type == "baCase" && _id == $id && isVisible == true][0] {
    _id, beforeImage, afterImage,
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current, category },
    "sessions": sessions[$locale], "elapsed": elapsed[$locale],
    "description": description[$locale],
    "prevCase": *[_type == "baCase" && isVisible == true && sortOrder < ^.sortOrder] | order(sortOrder desc)[0] { _id },
    "nextCase": *[_type == "baCase" && isVisible == true && sortOrder > ^.sortOrder] | order(sortOrder asc)[0] { _id }
  }
`;

// === Promotion ===
export const promotionsQuery = `
  *[_type == "promotion" && endDate >= now()] | order(sortOrder asc) {
    _id, "title": title[$locale], image, "description": description[$locale],
    eventPrice, startDate, endDate, showOnMain,
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current, category, priceOptions }
  }
`;

// === Hero ===
export const heroContentQuery = `
  *[_type == "pageHero" && _id == "page-hero-main"][0] {
    heroVideo, heroImage,
    "title": title[$locale], "subtitle": subtitle[$locale]
  }
`;

export const pageHeroQuery = `
  *[_type == "pageHero" && _id == $docId][0] {
    "title": title[$locale], "subtitle": subtitle[$locale], heroImage
  }
`;

// === Doctor ===
export const doctorsQuery = `
  *[_type == "doctor" && isVisible == true] | order(sortOrder asc) {
    _id, "name": name[$locale], "position": position[$locale],
    profileImage, "philosophy": philosophy[$locale],
    licenseNumber, "specialties": specialties[][$locale],
    "careers": careers[][$locale]
  }
`;

// === Clinic Info ===
export const clinicInfoQuery = `
  *[_type == "clinicInfo"][0] {
    "address": address[$locale], phone, email,
    "businessHours": businessHours[] { dayOfWeek, "day": day[$locale], open, close, "note": note[$locale] },
    "closedDayNotice": closedDayNotice[$locale],
    "walkingGuide": walkingGuide[$locale],
    snsLinks, messengerLinks,
    locationCoordinates
  }
`;

export const contactSectionConfigQuery = `
  *[_type == "pageHero" && _id == "page-hero-contact"][0] {
    "title": title[$locale],
    "subtitle": subtitle[$locale]
  }
`;

// === QuickEntry ===
export const quickEntryTabsQuery = `
  *[_type == "quickEntryTab"] | order(sortOrder asc) {
    _id, key, "label": label[$locale]
  }
`;

export const quickEntryCardsQuery = `
  *[_type == "quickEntryCard" && tab == $tab] | order(sortOrder asc) {
    _id,
    "title": title[$locale],
    "description": description[$locale],
    icon,
    linkUrl,
    "linkedTreatments": linkedTreatments[]->{
      "slug": slug.current,
      category
    }
  }
`;

// === Media ===
export const pressArticlesQuery = `
  *[_type == "pressArticle"] | order(publishDate desc) {
    _id, "title": title[$locale], source, url, thumbnail, publishDate, views
  }
`;

export const youtubeVideosQuery = `
  *[_type == "youtubeVideo"] | order(publishDate desc) {
    _id, "title": title[$locale], youtubeId, thumbnail, "description": description[$locale], publishDate
  }
`;

export const blogPostsQuery = `
  *[_type == "blogPost"] | order(publishDate desc) {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, publishDate, views
  }
`;

export const noticesQuery = `
  *[_type == "notice"] | order(isPinned desc, publishDate desc) {
    _id, "title": title[$locale], publishDate, isPinned, views
  }
`;

// === Media Detail ===
export const pressArticleDetailQuery = `
  *[_type == "pressArticle" && _id == $slug][0] {
    _id, "title": title[$locale], source, url, thumbnail, publishDate, views,
    "content": content[$locale],
    "prevArticle": *[_type == "pressArticle" && publishDate > ^.publishDate] | order(publishDate asc)[0] { _id, "title": title[$locale] },
    "nextArticle": *[_type == "pressArticle" && publishDate < ^.publishDate] | order(publishDate desc)[0] { _id, "title": title[$locale] },
    "position": count(*[_type == "pressArticle" && publishDate > ^.publishDate]) + 1,
    "total": count(*[_type == "pressArticle"])
  }
`;

export const blogPostDetailQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, publishDate, views,
    "content": content[$locale],
    "prevArticle": *[_type == "blogPost" && publishDate > ^.publishDate] | order(publishDate asc)[0] { "slug": slug.current, "title": title[$locale] },
    "nextArticle": *[_type == "blogPost" && publishDate < ^.publishDate] | order(publishDate desc)[0] { "slug": slug.current, "title": title[$locale] },
    "position": count(*[_type == "blogPost" && publishDate > ^.publishDate]) + 1,
    "total": count(*[_type == "blogPost"])
  }
`;

export const noticeDetailQuery = `
  *[_type == "notice" && _id == $slug][0] {
    _id, "title": title[$locale], publishDate, isPinned, views,
    "content": content[$locale],
    "prevArticle": *[_type == "notice" && (isPinned == true && ^.isPinned == false) || (isPinned == ^.isPinned && publishDate > ^.publishDate)] | order(isPinned desc, publishDate asc)[0] { _id, "title": title[$locale] },
    "nextArticle": *[_type == "notice" && (isPinned == false && ^.isPinned == true) || (isPinned == ^.isPinned && publishDate < ^.publishDate)] | order(isPinned desc, publishDate desc)[0] { _id, "title": title[$locale] },
    "position": count(*[_type == "notice" && (
      (isPinned == true && ^.isPinned == false) ||
      (isPinned == ^.isPinned && publishDate > ^.publishDate)
    )]) + 1,
    "total": count(*[_type == "notice"])
  }
`;

// === Singletons ===
export const brandPhilosophyQuery = `
  *[_type == "brandPhilosophy"][0] {
    "title": title[$locale], "subtitle": subtitle[$locale],
    "slogan": slogan[$locale],
    backgroundImage, "content": content[$locale],
    "values": values[] {
      _key,
      titleKo,
      titleEn,
      "description": description[$locale],
      "image": backgroundImage
    }
  }
`;

export const statsStripQuery = `
  *[_type == "statsStrip"][0] {
    "stats": stats[] { "label": label[$locale], number, unit, "description": description[$locale] }
  }
`;

export const eventPopupQuery = `
  *[_type == "eventPopup" && isVisible == true
    && (!defined(startDate) || dateTime(now()) >= dateTime(startDate))
    && (!defined(endDate) || dateTime(now()) <= dateTime(endDate))
  ] | order(_createdAt asc) {
    _id, image, "title": title[$locale], linkUrl
  }
`;

export const facilitiesQuery = `
  *[_type == "facility"] | order(orderRank asc) {
    _id, "name": name[$locale], image, "description": description[$locale]
  }
`;

export const equipmentQuery = `
  *[_type == "equipment"] | order(orderRank asc) {
    _id, "name": name[$locale], image, "description": description[$locale], manufacturer
  }
`;

// === Nav Menu Treatments ===
export interface NavTreatment {
  slug: string;
  category: string;
  name: { ko?: string; en?: string; zh?: string; ja?: string };
}

export const navTreatmentsQuery = `
  *[_type == "treatment" && showInMenu == true && isVisible == true] | order(category asc, sortOrder asc) {
    "slug": slug.current,
    category,
    "name": { "ko": name.ko, "en": name.en, "zh": name.zh, "ja": name.ja }
  }
`;
