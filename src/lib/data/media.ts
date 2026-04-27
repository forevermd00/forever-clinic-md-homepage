import { sanityFetch } from '@/lib/sanity/fetch';
import {
  pressArticlesQuery,
  blogPostsQuery,
  youtubeVideosQuery,
  noticesQuery,
  pressArticleDetailQuery,
  blogPostDetailQuery,
  noticeDetailQuery,
} from '@/lib/sanity/queries';
import type { NoticeItem } from '@/components/media/NoticeTable';

/* ─── Sanity raw shapes ─── */

interface SanityPressArticle {
  _id: string;
  title?: string;
  source?: string;
  url?: string;
  thumbnail?: unknown;
  publishDate?: string;
}

interface SanityBlogPost {
  _id: string;
  title?: string;
  slug?: string;
  thumbnail?: unknown;
  category?: string;
  publishDate?: string;
}

interface SanityYoutubeVideo {
  _id: string;
  title?: string;
  youtubeId?: string;
  thumbnail?: unknown;
  description?: string;
  publishDate?: string;
}

interface SanityNotice {
  _id: string;
  title?: string;
  publishDate?: string;
  isPinned?: boolean;
}

/* ─── Page types ─── */

export type PressArticle = {
  slug: string;
  date: string;
  title: string;
  description: string;
};

export type BlogPost = {
  slug: string;
  date: string;
  title: string;
  description: string;
};

export type YoutubeVideo = {
  slug: string;
  title: string;
  views: string;
};

/* ─── Fallback Data ─── */

const FALLBACK_PRESS: PressArticle[] = [
  {
    slug: 'ulthera-award-2026',
    date: '2026.04.10',
    title: '포에버 클리닉 명동, 울쎄라 공식 인증 클리닉 선정',
    description:
      '포에버 클리닉 명동점이 울쎄라 본사로부터 공식 인증 클리닉으로 선정되었습니다. 연간 시술 건수와 안전 관리 기준을 충족하여 인증을 획득했습니다.',
  },
  {
    slug: 'myeongdong-expansion',
    date: '2026.03.22',
    title: '명동점 확장 이전 오픈 안내',
    description:
      '더 넓아진 공간, 최신 장비로 업그레이드된 포에버 클리닉 명동점이 새롭게 오픈합니다. 확장된 시설에서 더 편안한 시술 경험을 제공합니다.',
  },
  {
    slug: 'skincare-trend-2026',
    date: '2026.02.15',
    title: '2026 피부 관리 트렌드 — 전문의 인터뷰',
    description:
      '포에버 클리닉 원장이 올해의 피부 관리 트렌드에 대해 전문 매체와 인터뷰를 진행했습니다. 엑소좀과 스킨부스터의 부상에 대해 다루었습니다.',
  },
];

const FALLBACK_BLOG: BlogPost[] = [
  {
    slug: 'spring-skincare-tips',
    date: '2026.04.18',
    title: '봄철 피부 관리 꿀팁 5가지',
    description:
      '환절기 피부 트러블을 예방하고 건강한 피부를 유지하는 방법을 소개합니다. 자외선 차단부터 보습까지, 전문의의 조언을 확인해보세요.',
  },
  {
    slug: 'exosome-explained',
    date: '2026.03.30',
    title: '엑소좀 시술이란? — 원리부터 효과까지',
    description:
      '최근 주목받고 있는 엑소좀 시술의 원리와 기대 효과, 시술 후 관리법에 대해 상세히 알려드립니다.',
  },
  {
    slug: 'lifting-comparison',
    date: '2026.03.05',
    title: '울쎄라 vs 써마지 — 어떤 리프팅이 나에게 맞을까?',
    description:
      '대표적인 비수술 리프팅 시술인 울쎄라와 써마지의 차이점을 비교 분석합니다. 피부 타입별 추천 시술을 확인해보세요.',
  },
];

const FALLBACK_VIDEOS: YoutubeVideo[] = [
  {
    slug: 'ulthera-process',
    title: '울쎄라 리프팅 시술 과정 A to Z',
    views: '조회수 12,340회',
  },
  {
    slug: 'thermage-review',
    title: '써마지 FLX 시술 후기 — 실제 고객 인터뷰',
    views: '조회수 8,920회',
  },
  {
    slug: 'skincare-routine',
    title: '피부과 전문의가 알려주는 데일리 스킨케어 루틴',
    views: '조회수 25,100회',
  },
];

const FALLBACK_NOTICES: NoticeItem[] = [
  {
    id: 1,
    slug: 'myeongdong-open',
    title: '포에버 클리닉 명동점 오픈 안내',
    date: '2025.03.01',
    views: 1203,
  },
  {
    id: 2,
    slug: 'pico-laser-upgrade',
    title: '신규 시술 도입 안내 – 피코 레이저 업그레이드',
    date: '2025.04.22',
    views: 504,
  },
  {
    id: 3,
    slug: 'summer-hours',
    title: '여름 휴가 기간 진료 시간 변경 안내',
    date: '2025.06.10',
    views: 278,
  },
  {
    id: 4,
    slug: 'privacy-policy-july',
    title: '개인정보처리방침 개정 안내 (2025년 7월)',
    date: '2025.06.30',
    views: 156,
  },
  {
    id: 5,
    slug: 'myeongdong-renewal',
    title: '포에버 클리닉 명동점 리뉴얼 오픈 안내',
    date: '2025.07.15',
    views: 891,
  },
  {
    id: 6,
    slug: 'chuseok-hours',
    title: '2025년 추석 연휴 진료 안내',
    date: '2025.09.01',
    views: 342,
  },
];

/* ─── Mapping helpers ─── */

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function mapPressArticles(raw: SanityPressArticle[]): PressArticle[] {
  return raw.map((a) => ({
    slug: a._id,
    date: formatDate(a.publishDate),
    title: a.title || '',
    description: a.source ? `${a.source}` : '',
  }));
}

function mapBlogPosts(raw: SanityBlogPost[]): BlogPost[] {
  return raw.map((p) => ({
    slug: p.slug || p._id,
    date: formatDate(p.publishDate),
    title: p.title || '',
    description: p.category || '',
  }));
}

function mapYoutubeVideos(raw: SanityYoutubeVideo[]): YoutubeVideo[] {
  return raw.map((v) => ({
    slug: v.youtubeId || v._id,
    title: v.title || '',
    views: v.description || '',
  }));
}

function mapNotices(raw: SanityNotice[]): NoticeItem[] {
  return raw.map((n, i) => ({
    id: i + 1,
    slug: n._id,
    title: n.title || '',
    date: formatDate(n.publishDate),
    views: 0,
  }));
}

/* ─── Fetch Functions ─── */

export async function getPressArticles(
  locale: string,
): Promise<PressArticle[]> {
  const data = await sanityFetch<SanityPressArticle[]>(pressArticlesQuery, {
    locale,
  });

  if (!data || data.length === 0) return FALLBACK_PRESS;

  return mapPressArticles(data);
}

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  const data = await sanityFetch<SanityBlogPost[]>(blogPostsQuery, { locale });

  if (!data || data.length === 0) return FALLBACK_BLOG;

  return mapBlogPosts(data);
}

export async function getYoutubeVideos(
  locale: string,
): Promise<YoutubeVideo[]> {
  const data = await sanityFetch<SanityYoutubeVideo[]>(youtubeVideosQuery, {
    locale,
  });

  if (!data || data.length === 0) return FALLBACK_VIDEOS;

  return mapYoutubeVideos(data);
}

export async function getNotices(locale: string): Promise<NoticeItem[]> {
  const data = await sanityFetch<SanityNotice[]>(noticesQuery, { locale });

  if (!data || data.length === 0) return FALLBACK_NOTICES;

  return mapNotices(data);
}

/* ─── Detail Types ─── */

export type ArticleDetail = {
  slug: string;
  title: string;
  date: string;
  content: string;
  views?: number;
};

export type ArticleNav = {
  slug: string;
  title: string;
} | null;

interface SanityArticleDetail {
  _id: string;
  title?: string;
  slug?: string;
  content?: string;
  publishDate?: string;
  source?: string;
  prevArticle?: { _id?: string; slug?: string; title?: string };
  nextArticle?: { _id?: string; slug?: string; title?: string };
}

/* ─── Detail Fetch Functions ─── */

export async function getPressDetail(
  slug: string,
  locale: string,
): Promise<{
  article: ArticleDetail;
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
} | null> {
  const data = await sanityFetch<SanityArticleDetail>(pressArticleDetailQuery, {
    slug,
    locale,
  });

  if (!data || !data.title) return null;

  return {
    article: {
      slug: data._id,
      title: data.title,
      date: formatDate(data.publishDate),
      content: data.content || '',
    },
    prevArticle: data.prevArticle?.title
      ? { slug: data.prevArticle._id || '', title: data.prevArticle.title }
      : null,
    nextArticle: data.nextArticle?.title
      ? { slug: data.nextArticle._id || '', title: data.nextArticle.title }
      : null,
  };
}

export async function getBlogDetail(
  slug: string,
  locale: string,
): Promise<{
  article: ArticleDetail;
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
} | null> {
  const data = await sanityFetch<SanityArticleDetail>(blogPostDetailQuery, {
    slug,
    locale,
  });

  if (!data || !data.title) return null;

  return {
    article: {
      slug: data.slug || data._id,
      title: data.title,
      date: formatDate(data.publishDate),
      content: data.content || '',
    },
    prevArticle: data.prevArticle?.title
      ? {
          slug: data.prevArticle.slug || data.prevArticle._id || '',
          title: data.prevArticle.title,
        }
      : null,
    nextArticle: data.nextArticle?.title
      ? {
          slug: data.nextArticle.slug || data.nextArticle._id || '',
          title: data.nextArticle.title,
        }
      : null,
  };
}

export async function getNoticeDetail(
  slug: string,
  locale: string,
): Promise<{
  article: ArticleDetail;
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
} | null> {
  const data = await sanityFetch<SanityArticleDetail>(noticeDetailQuery, {
    slug,
    locale,
  });

  if (!data || !data.title) return null;

  return {
    article: {
      slug: data._id,
      title: data.title,
      date: formatDate(data.publishDate),
      content: data.content || '',
    },
    prevArticle: data.prevArticle?.title
      ? { slug: data.prevArticle._id || '', title: data.prevArticle.title }
      : null,
    nextArticle: data.nextArticle?.title
      ? { slug: data.nextArticle._id || '', title: data.nextArticle.title }
      : null,
  };
}
