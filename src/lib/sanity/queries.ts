// === Home Page ===
export const homeHeroQuery = `*[_type == "pageHero" && _id == "page-hero-main"][0]`;

export const homeQuickEntryQuery = `*[_type == "quickEntryCard" && isVisible == true] | order(sortOrder asc)`;

export const homePromoQuery = `*[_type == "promotion" && showOnMain == true] | order(sortOrder asc)[0...3]`;

export const homeBACasesQuery = `*[_type == "baCase" && showOnMain == true && isVisible == true] | order(sortOrder asc)[0...5]`;

export const homeBrandQuery = `*[_type == "brandPhilosophy"][0]`;

export const homeStatsQuery = `*[_type == "statsStrip"][0]`;

export const homeDoctorsQuery = `*[_type == "doctor" && isVisible == true] | order(sortOrder asc)`;

export const homeClinicInfoQuery = `*[_type == "clinicInfo"][0]`;

export const homeEventPopupQuery = `*[_type == "eventPopup" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)][0]`;

// === Treatment ===
export const treatmentsByCategoryQuery = `*[_type == "treatment" && isVisible == true && category == $category] | order(sortOrder asc)`;

export const treatmentsByQuickEntryQuery = `
  *[_type == "quickEntryCard" && _id == $cardId][0].linkedTreatments[]-> {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, priceOptions, isEvent
  } | order(sortOrder asc)
`;

export const treatmentDetailQuery = `*[_type == "treatment" && slug.current == $slug][0]{ ..., relatedTreatments[]-> }`;

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
    "treatment": treatment-> { "name": name[$locale], "slug": slug.current, priceOptions }
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
    licenseNumber, "specialties": specialties[][$locale]
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
  *[_type == "quickEntryCard" && tab->key == $tab] | order(sortOrder asc) {
    _id, "title": title[$locale], "description": description[$locale],
    icon, linkUrl
  }
`;

// === Media ===
export const pressArticlesQuery = `
  *[_type == "pressArticle"] | order(publishDate desc) {
    _id, "title": title[$locale], source, url, thumbnail, publishDate
  }
`;

export const youtubeVideosQuery = `
  *[_type == "youtubeVideo"] | order(publishDate desc) {
    _id, "title": title[$locale], youtubeId, thumbnail, "description": description[$locale], publishDate
  }
`;

export const blogPostsQuery = `
  *[_type == "blogPost"] | order(publishDate desc) {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, publishDate
  }
`;

export const noticesQuery = `
  *[_type == "notice"] | order(isPinned desc, publishDate desc) {
    _id, "title": title[$locale], publishDate, isPinned
  }
`;

// === Media Detail ===
export const pressArticleDetailQuery = `
  *[_type == "pressArticle" && _id == $slug][0] {
    _id, "title": title[$locale], source, url, thumbnail, publishDate,
    "content": content[$locale],
    "prevArticle": *[_type == "pressArticle" && publishDate > ^.publishDate] | order(publishDate asc)[0] { _id, "title": title[$locale] },
    "nextArticle": *[_type == "pressArticle" && publishDate < ^.publishDate] | order(publishDate desc)[0] { _id, "title": title[$locale] }
  }
`;

export const blogPostDetailQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, publishDate,
    "content": content[$locale],
    "prevArticle": *[_type == "blogPost" && publishDate > ^.publishDate] | order(publishDate asc)[0] { "slug": slug.current, "title": title[$locale] },
    "nextArticle": *[_type == "blogPost" && publishDate < ^.publishDate] | order(publishDate desc)[0] { "slug": slug.current, "title": title[$locale] }
  }
`;

export const noticeDetailQuery = `
  *[_type == "notice" && _id == $slug][0] {
    _id, "title": title[$locale], publishDate, isPinned,
    "content": content[$locale],
    "prevArticle": *[_type == "notice" && (isPinned == true && ^.isPinned == false) || (isPinned == ^.isPinned && publishDate > ^.publishDate)] | order(isPinned desc, publishDate asc)[0] { _id, "title": title[$locale] },
    "nextArticle": *[_type == "notice" && (isPinned == false && ^.isPinned == true) || (isPinned == ^.isPinned && publishDate < ^.publishDate)] | order(isPinned desc, publishDate desc)[0] { _id, "title": title[$locale] }
  }
`;

// === Singletons ===
export const brandPhilosophyQuery = `
  *[_type == "brandPhilosophy"][0] {
    "title": title[$locale], "subtitle": subtitle[$locale],
    backgroundImage, "content": content[$locale],
    "values": values[] {
      _key, titleKo, titleEn,
      "description": description[$locale],
      image
    }
  }
`;

export const statsStripQuery = `
  *[_type == "statsStrip"][0] {
    "stats": stats[] { "label": label[$locale], number, unit }
  }
`;

export const eventPopupQuery = `
  *[_type == "eventPopup" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)][0] {
    _id, image, "title": title[$locale], "description": description[$locale], linkUrl
  }
`;

export const facilitiesQuery = `
  *[_type == "facility"] | order(sortOrder asc) {
    _id, "name": name[$locale], image, "description": description[$locale]
  }
`;

export const equipmentQuery = `
  *[_type == "equipment"] | order(sortOrder asc) {
    _id, "name": name[$locale], image, "description": description[$locale], manufacturer
  }
`;
