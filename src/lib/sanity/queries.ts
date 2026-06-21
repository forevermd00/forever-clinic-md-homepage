// === Signature Programs (treatment 타입, isSignature == true) ===
export const signatureProgramsQuery = `
  *[_type == "treatment" && isSignature == true && isVisible == true] | order(sortOrder asc, _createdAt asc) {
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

export const homePressQuery = `
  *[_type == "pressArticle" && isVisible != false] | order(coalesce(publishedAt, publishDate) desc)[0...3] {
    _id,
    "title": title[$locale],
    "excerpt": excerpt[$locale],
    "publisher": coalesce(publisher, source),
    "publishedAt": coalesce(publishedAt, publishDate),
    thumbnail
  }
`;

export const homeQuickEntryQuery = `*[_type == "quickEntryCard" && isVisible == true] | order(sortOrder asc)`;

export const homePromoQuery = `*[_type == "promotion" && showOnMain == true] | order(sortOrder asc)[0...3]`;

export const homeEventTreatmentsQuery = `
  *[_type == "treatment" && isVisible == true && count(priceOptions[isEvent == true]) > 0 && showInMenu == true] | order(sortOrder asc, _createdAt asc) {
    _id, name, "slug": slug.current, category, tagline, priceOptions, "isEvent": count(priceOptions[isEvent == true]) > 0
  }
`;

export const homeBACasesQuery = `*[_type == "baCase" && showOnMain == true && isVisible == true] | order(_createdAt desc)[0...3] {
  _id, beforeImage, afterImage,
  "title": coalesce(title[$locale], title.ko),
  "treatmentName": treatment->name[$locale],
  "description": coalesce(description[$locale], description.ko),
  "sessions": sessions[$locale],
  categories
}`;

export const homeBrandQuery = `*[_type == "brandPhilosophy"][0]{ slogan, subtitle, badge, values }`;

export const homeStatsQuery = `*[_type == "statsStrip"][0]`;

export const homeDoctorsQuery = `*[_type == "doctor" && isVisible != false] | order(sortOrder asc)`;

export const homeClinicInfoQuery = `*[_type == "clinicInfo"][0]`;

export const homeEventPopupQuery = `*[_type == "eventPopup" && dateTime(now()) >= dateTime(startDate) && dateTime(now()) <= dateTime(endDate)][0]`;

// === Treatment ===
export const treatmentsByCategoryQuery = `*[_type == "treatment" && isVisible == true && category == $category] | order(sortOrder asc, _createdAt asc) {
  ..., "imageUrl": thumbnail.asset->url
}`;

export const allTreatmentsGroupedQuery = `*[_type == "treatment" && isVisible == true] | order(sortOrder asc, _createdAt asc) {
  _id, name, slug, category, tagline, keywords, description, composition, priceOptions, "isEvent": count(priceOptions[isEvent == true]) > 0, isSignature, downtime, treatmentTime, duration,
  "imageUrl": thumbnail.asset->url
}`;

export const treatmentsByQuickEntryQuery = `
  *[_type == "quickEntryCard" && _id == $cardId][0].linkedTreatments[]-> {
    _id, "name": name[$locale], "tagline": tagline[$locale], category,
    "slug": slug.current, thumbnail, priceOptions, "isEvent": count(priceOptions[isEvent == true]) > 0
  } | order(sortOrder asc)
`;

export const quickEntryCardBySlugQuery = `
  *[_type == "quickEntryCard" && slug.current == $slug][0] {
    _id,
    "title": title[$locale],
    "description": description[$locale],
    "slug": slug.current,
    "treatments": linkedTreatments[]-> {
      _id,
      "name": name[$locale],
      "tagline": tagline[$locale],
      "slug": slug.current,
      category,
      "imageUrl": thumbnail.asset->url,
      priceOptions[] { price, discountPrice },
      "isEvent": count(priceOptions[isEvent == true]) > 0,
      isVisible
    }
  }
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
    "isEvent": count(priceOptions[isEvent == true]) > 0,
    isSignature,
    isVisible,
    duration,
    downtime,
    treatmentTime,
    "imageUrl": thumbnail.asset->url,
    detailDisplayMode,
    "detailImagesLocalized": detailImagesLocalized[$locale][].asset->url,
    priceOptions[] {
      _key,
      "name": coalesce(name[$locale], name.ko),
      "caption": coalesce(caption[$locale], caption.ko),
      area,
      price,
      discountPrice,
      isEvent
    },
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
      "isEvent": count(priceOptions[isEvent == true]) > 0
    }
  }
`;

// 장바구니 가격 재대조용 — 담긴 시술의 live priceOption을 _key 기준으로 조회.
// 견적 스냅샷 가격이 변동/종료되었는지 판정하는 단일 소스.
export const cartReconcileQuery = `
  *[_type == "treatment" && slug.current in $slugs]{
    "slug": slug.current,
    "name": name[$locale],
    "isVisible": isVisible,
    priceOptions[]{
      _key,
      "name": coalesce(name[$locale], name.ko),
      "caption": coalesce(caption[$locale], caption.ko),
      area,
      price,
      discountPrice,
      isEvent
    }
  }
`;

export const allTreatmentsForCartQuery = `
  *[_type == "treatment" && isVisible == true] | order(sortOrder asc, _createdAt asc) {
    _id, "name": name[$locale], "slug": slug.current, category, priceOptions, "isEvent": count(priceOptions[isEvent == true]) > 0
  }
`;

// === B&A ===
export const baCasesQuery = `*[_type == "baCase" && isVisible == true] | order(sortOrder asc)`;

export const baCasesFilteredQuery = `
  *[_type == "baCase" && isVisible == true
    && ($category == "all" || $category in categories)
  ] | order(sortOrder asc) {
    _id, beforeImage, afterImage,
    "title": coalesce(title[$locale], title.ko),
    "treatmentName": treatment->name[$locale],
    "description": coalesce(description[$locale], description.ko),
    categories,
    "sessions": sessions[$locale]
  }
`;

export const baCaseDetailQuery = `
  *[_type == "baCase" && _id == $id && isVisible == true][0] {
    _id, beforeImage, afterImage,
    "title": coalesce(title[$locale], title.ko),
    "treatmentName": treatment->name[$locale],
    "description": coalesce(description[$locale], description.ko),
    categories,
    "sessions": sessions[$locale],
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
    "title": title[$locale], "subtitle": subtitle[$locale],
    "badge": badge[$locale]
  }
`;

export const pageHeroQuery = `
  *[_type == "pageHero" && _id == $docId][0] {
    "title": title[$locale], "subtitle": subtitle[$locale], heroImage
  }
`;

// === Doctor ===
export const doctorsQuery = `
  *[_type == "doctor" && isVisible != false] | order(sortOrder asc) {
    _id, "name": name[$locale], "position": position[$locale],
    profileImage, "philosophy": philosophy[$locale],
    licenseNumber, "specialties": specialties[][$locale],
    "careers": careers[][$locale]
  }
`;

// === Clinic Info ===
export const clinicInfoQuery = `
  *[_type == "clinicInfo"][0] {
    "clinicName": clinicName[$locale], "logoUrl": logo.asset->url,
    "address": address[$locale], phone, email,
    "businessHours": businessHours[] { dayOfWeek, "day": day[$locale], open, close, "note": note[$locale] },
    "closedDayNotice": closedDayNotice[$locale],
    "walkingGuide": walkingGuide[$locale],
    snsLinks, messengerLinks[] { _key, platform, url, label, "logo": logo { asset->{ url } }, "qr": qrCode { asset->{ url } }, isVisible, sortKo, sortEn, sortZh, sortJa },
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
  *[_type == "quickEntryTab" && isVisible != false] | order(sortOrder asc) {
    _id, key, "label": label[$locale]
  }
`;

export const quickEntryAllCardsQuery = `
  *[_type == "quickEntryCard" && isVisible != false] | order(sortOrder asc) {
    _id,
    "title": title[$locale],
    "description": description[$locale],
    "tabRef": tab._ref,
    "tabKey": tab->key,
    "tabLabel": tab->label[$locale],
    "tabSort": tab->sortOrder,
    "tabVisible": tab->isVisible,
    "cardSlug": slug.current,
    icon,
    "linkedTreatments": linkedTreatments[]->{ "slug": slug.current, category }
  }
`;

// === Media ===
export const pressArticlesQuery = `
  *[_type == "pressArticle" && isVisible != false] | order(coalesce(publishedAt, publishDate) desc) {
    _id, "title": title[$locale], "excerpt": excerpt[$locale],
    "publisher": coalesce(publisher, source), url, thumbnail,
    "publishedAt": coalesce(publishedAt, publishDate), views
  }
`;

export const youtubeVideosQuery = `
  *[_type == "youtubeVideo" && isVisible != false
    && defined(displayLanguages) && count(displayLanguages) > 0 && $locale in displayLanguages
  ] | order(publishedAt desc) {
    _id, "title": title[$locale], youtubeId, youtubeUrl, publishedAt, displayLanguages
  }
`;

export const blogPostsQuery = `
  *[_type == "blogPost" && isVisible != false] | order(publishedAt desc) {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, publishedAt, views
  }
`;

export const noticesQuery = `
  *[_type == "notice" && isVisible != false] | order(isPinned desc, coalesce(publishDate, _createdAt) desc) {
    _id, "title": title[$locale], "publishedAt": coalesce(publishDate, _createdAt), isPinned, views
  }
`;

// === Media Detail ===
export const pressArticleDetailQuery = `
  *[_type == "pressArticle" && _id == $slug][0] {
    _id, "title": title[$locale], "excerpt": excerpt[$locale],
    "publisher": coalesce(publisher, source), url, thumbnail,
    "publishedAt": coalesce(publishedAt, publishDate), views,
    "pubDate": coalesce(publishedAt, publishDate),
    "prevArticle": *[_type == "pressArticle" && isVisible != false && coalesce(publishedAt, publishDate) > ^.pubDate] | order(coalesce(publishedAt, publishDate) asc)[0] { _id, "title": title[$locale] },
    "nextArticle": *[_type == "pressArticle" && isVisible != false && coalesce(publishedAt, publishDate) < ^.pubDate] | order(coalesce(publishedAt, publishDate) desc)[0] { _id, "title": title[$locale] },
    "position": count(*[_type == "pressArticle" && isVisible != false && coalesce(publishedAt, publishDate) > ^.pubDate]) + 1,
    "total": count(*[_type == "pressArticle" && isVisible != false])
  }
`;

export const blogPostDetailQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id, "title": title[$locale], "slug": slug.current, thumbnail, category, views,
    "publishedAt": coalesce(publishedAt, publishDate),
    "content": coalesce(markdownContent[$locale], ""),
    "prevArticle": *[_type == "blogPost" && coalesce(publishedAt, publishDate) > coalesce(^.publishedAt, ^.publishDate)] | order(coalesce(publishedAt, publishDate) asc)[0] { "slug": slug.current, "title": title[$locale] },
    "nextArticle": *[_type == "blogPost" && coalesce(publishedAt, publishDate) < coalesce(^.publishedAt, ^.publishDate)] | order(coalesce(publishedAt, publishDate) desc)[0] { "slug": slug.current, "title": title[$locale] },
    "position": count(*[_type == "blogPost" && coalesce(publishedAt, publishDate) > coalesce(^.publishedAt, ^.publishDate)]) + 1,
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
  *[_type == "brandPhilosophy" && _id == "brand-philosophy"][0] {
    "slogan": slogan[$locale],
    "subtitle": subtitle[$locale],
    badge,
    "values": values[] {
      _key,
      "titleKo": title.ko,
      "titleEn": title.en,
      "description": description[$locale],
      image
    }
  }
`;

export const statsStripQuery = `
  *[_type == "statsStrip"][0] {
    "stats": stats[] { "label": label[$locale], number, unit, "description": description[$locale] }
  }
`;

// 메인 진입 시 노출되는 팝업 — 노출 ON + 팝업 ON + 기간 내
export const eventPopupQuery = `
  *[_type == "eventPopup" && isVisible == true && showAsPopup != false
    && (!defined(startDate) || dateTime(now()) >= dateTime(string::split(startDate, "T")[0] + "T00:00:00+09:00"))
    && (!defined(endDate) || dateTime(now()) <= dateTime(string::split(endDate, "T")[0] + "T23:59:59+09:00"))
  ] | order(sortOrder asc, _createdAt asc) {
    _id,
    "uid": uid.current,
    "title": coalesce(title[$locale], title.ko),
    "pcImage": coalesce(pcImage[$locale], pcImage.ko),
    "mobileImage": coalesce(mobileImage[$locale], mobileImage.ko),
    image,
    "linkUrl": linkUrl
  }
`;

// 이벤트 상세에서 해석된 가격 옵션 raw 형태
export interface EventOptionRaw {
  _key?: string;
  name?: string;
  caption?: string;
  area?: string;
  price?: number;
  discountPrice?: number;
  isEvent?: boolean;
}

// 이벤트 메뉴(목록) — 노출 ON 전체
export const eventListQuery = `
  *[_type == "eventPopup" && isVisible == true] | order(sortOrder asc, _createdAt asc) {
    _id,
    "uid": uid.current,
    "title": coalesce(title[$locale], title.ko),
    "oneLineDescription": coalesce(oneLineDescription[$locale], oneLineDescription.ko),
    "pcImage": coalesce(pcImage[$locale], pcImage.ko),
    "mobileImage": coalesce(mobileImage[$locale], mobileImage.ko),
    image,
    startDate,
    endDate
  }
`;

// 이벤트 상세 — uid로 단건 조회, 연결 시술의 가격 옵션까지 해석
export const eventByUidQuery = `
  *[_type == "eventPopup" && isVisible == true && uid.current == $uid][0] {
    _id,
    "uid": uid.current,
    "title": coalesce(title[$locale], title.ko),
    "oneLineDescription": coalesce(oneLineDescription[$locale], oneLineDescription.ko),
    "description": coalesce(description[$locale], description.ko),
    "pcImage": coalesce(pcImage[$locale], pcImage.ko),
    "mobileImage": coalesce(mobileImage[$locale], mobileImage.ko),
    "detailImage": coalesce(detailImage[$locale], detailImage.ko),
    image,
    startDate,
    endDate,
    "linkedTreatments": linkedTreatments[]{
      optionKeys,
      "treatment": treatment->{
        _id,
        "slug": slug.current,
        "name": coalesce(name[$locale], name.ko),
        category,
        priceOptions[]{
          _key,
          "name": coalesce(name[$locale], name.ko),
          "caption": coalesce(caption[$locale], caption.ko),
          area,
          price,
          discountPrice,
          isEvent
        }
      }
    }
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
  *[_type == "treatment" && showInMenu == true && isVisible == true] | order(category asc, sortOrder asc, _createdAt asc) {
    "slug": slug.current,
    category,
    "name": { "ko": name.ko, "en": name.en, "zh": name.zh, "ja": name.ja }
  }
`;

// === Legal Documents ===
export const legalDocumentQuery = `
  *[_type == "legalDocument" && documentType == $documentType][0] {
    title,
    effectiveDate,
    publicationDate,
    contentKo,
    contentEn,
    contentZh,
    contentJa
  }
`;
