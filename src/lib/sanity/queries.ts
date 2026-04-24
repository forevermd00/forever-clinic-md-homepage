// === Treatment ===
export const treatmentsByCategoryQuery = `
  *[_type == "treatment" && isVisible == true && category == $category] | order(sortOrder asc) {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, priceOptions, isEvent
  }
`;

export const treatmentsByQuickEntryQuery = `
  *[_type == "quickEntryCard" && _id == $cardId][0].linkedTreatments[]-> {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, priceOptions, isEvent
  } | order(sortOrder asc)
`;

export const treatmentDetailQuery = `
  *[_type == "treatment" && slug.current == $slug && isVisible == true][0] {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, "detailImage": detailImage[$locale],
    "effects": effects[][$locale], "duration": duration[$locale],
    "downtime": downtime[$locale], "treatmentTime": treatmentTime[$locale],
    priceOptions,
    "faq": faq[] { "question": question[$locale], "answer": answer[$locale] },
    "relatedTreatments": relatedTreatments[]-> {
      _id, "name": name[$locale], "slug": slug.current, thumbnail, priceOptions
    },
    isEvent
  }
`;

export const allTreatmentsForCartQuery = `
  *[_type == "treatment" && isVisible == true] | order(sortOrder asc) {
    _id, "name": name[$locale], "slug": slug.current, category, priceOptions, isEvent
  }
`;

// === B&A ===
export const baCasesQuery = `
  *[_type == "baCase" && isVisible == true
    && ($category == "all" || treatment->category == $category)
  ] | order(sortOrder asc) {
    _id, beforeImage, afterImage,
    "treatment": treatment-> { _id, "name": name[$locale], "slug": slug.current, category },
    "sessions": sessions[$locale], "elapsed": elapsed[$locale]
  }
`;

export const baCasesForMainQuery = `
  *[_type == "baCase" && isVisible == true && showOnMain == true] | order(sortOrder asc)[0...5] {
    _id, beforeImage, afterImage,
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current },
    "sessions": sessions[$locale]
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
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current, priceOptions }
  }
`;

export const promotionsForMainQuery = `
  *[_type == "promotion" && endDate >= now() && showOnMain == true] | order(sortOrder asc)[0...3] {
    _id, "title": title[$locale], image,
    eventPrice, startDate, endDate,
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current, priceOptions }
  }
`;

// === Hero ===
export const heroContentQuery = `
  *[_type == "heroContent"][0] {
    mainVideo, mainFallbackImage,
    "mainTitle": mainTitle[$locale], "mainSubtitle": mainSubtitle[$locale],
    "pageHeroes": pageHeroes[] { pageKey, "title": title[$locale], "subtitle": subtitle[$locale] }
  }
`;

export const heroContentByPageQuery = `
  *[_type == "heroContent"][0].pageHeroes[pageKey == $pageKey][0] {
    "title": title[$locale], "subtitle": subtitle[$locale]
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
    "businessHours": businessHours[] { "day": day[$locale], open, close, "note": note[$locale] },
    "closedDayNotice": closedDayNotice[$locale],
    googleMapsEmbedUrl, "walkingGuide": walkingGuide[$locale],
    snsLinks, messengerLinks
  }
`;

// === QuickEntry ===
export const quickEntryCardsQuery = `
  *[_type == "quickEntryCard" && tab == $tab] | order(sortOrder asc) {
    _id, "title": title[$locale], "description": description[$locale],
    icon, linkUrl
  }
`;

// === Media ===
export const pressArticlesQuery = `
  *[_type == "pressArticle" && isVisible == true] | order(publishedAt desc) {
    _id, "title": title[$locale], publisher, url, thumbnail, publishedAt
  }
`;

export const youtubeVideosQuery = `
  *[_type == "youtubeVideo" && isVisible == true] | order(publishedAt desc) {
    _id, "title": title[$locale], youtubeUrl, thumbnail, "description": description[$locale], duration, publishedAt
  }
`;

export const blogPostsQuery = `
  *[_type == "blogPost" && isVisible == true] | order(publishedAt desc) {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, "excerpt": excerpt[$locale], category, publishedAt
  }
`;

export const noticesQuery = `
  *[_type == "notice" && isVisible == true] | order(isPinned desc, publishedAt desc) {
    _id, "title": title[$locale], category, publishedAt, isPinned
  }
`;

// === Singletons ===
export const brandPhilosophyQuery = `
  *[_type == "brandPhilosophy"][0] {
    "slogan": slogan[$locale],
    "values": values[] { "title": title[$locale], "description": description[$locale], backgroundImage }
  }
`;

export const statsStripQuery = `
  *[_type == "statsStrip"][0] {
    "items": items[] { "value": value[$locale], "label": label[$locale] }
  }
`;

export const eventPopupQuery = `
  *[_type == "eventPopup" && isActive == true][0] {
    _id, image, "title": title[$locale], "description": description[$locale],
    linkedPromotion, targetLocales, enableDismiss
  }
`;

export const facilitiesQuery = `
  *[_type == "facility"] | order(sortOrder asc) {
    _id, "name": name[$locale], image, "description": description[$locale]
  }
`;

export const equipmentQuery = `
  *[_type == "equipment"] | order(sortOrder asc) {
    _id, "name": name[$locale], image, "description": description[$locale],
    "relatedTreatments": relatedTreatments[]-> { "name": name[$locale], "slug": slug.current }
  }
`;
