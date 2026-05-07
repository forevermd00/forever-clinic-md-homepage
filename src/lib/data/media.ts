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
import { urlFor } from '@/lib/sanity/image';
import type { NoticeItem } from '@/components/media/NoticeTable';
import type { PortableTextBlock } from '@portabletext/types';

/* ─── Sanity raw shapes ─── */

interface SanityPressArticle {
  _id: string;
  title?: string;
  source?: string;
  url?: string;
  thumbnail?: unknown;
  publishDate?: string;
  views?: number;
}

interface SanityBlogPost {
  _id: string;
  title?: string;
  slug?: string;
  thumbnail?: unknown;
  category?: string;
  publishDate?: string;
  views?: number;
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
  views?: number;
}

/* ─── Page types ─── */

export type PressArticle = {
  slug: string;
  date: string;
  title: string;
  description: string;
  thumbnail?: string;
  views?: number;
};

export type BlogPost = {
  slug: string;
  date: string;
  title: string;
  description: string;
  thumbnail?: string;
  views?: number;
};

export type YoutubeVideo = {
  slug: string;
  title: string;
  views: string;
};

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
    thumbnail: a.thumbnail
      ? urlFor(a.thumbnail)?.width(600).height(400).url() || undefined
      : undefined,
    views: a.views ?? 0,
  }));
}

function mapBlogPosts(raw: SanityBlogPost[]): BlogPost[] {
  return raw.map((p) => ({
    slug: p.slug || p._id,
    date: formatDate(p.publishDate),
    title: p.title || '',
    description: p.category || '',
    thumbnail: p.thumbnail
      ? urlFor(p.thumbnail)?.width(600).height(400).url() || undefined
      : undefined,
    views: p.views ?? 0,
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
  const total = raw.length;
  return raw.map((n, i) => ({
    id: total - i,
    slug: n._id,
    title: n.title || '',
    date: formatDate(n.publishDate),
    views: n.views ?? 0,
  }));
}

/* ─── Fetch Functions ─── */

export async function getPressArticles(
  locale: string,
): Promise<PressArticle[]> {
  const data = await sanityFetch<SanityPressArticle[]>(pressArticlesQuery, {
    locale,
  });

  if (!data || data.length === 0) return [];

  return mapPressArticles(data);
}

export async function getBlogPosts(locale: string): Promise<BlogPost[]> {
  const data = await sanityFetch<SanityBlogPost[]>(blogPostsQuery, { locale });

  if (!data || data.length === 0) return [];

  return mapBlogPosts(data);
}

export async function getYoutubeVideos(
  locale: string,
): Promise<YoutubeVideo[]> {
  const data = await sanityFetch<SanityYoutubeVideo[]>(youtubeVideosQuery, {
    locale,
  });

  if (!data || data.length === 0) return [];

  return mapYoutubeVideos(data);
}

export async function getNotices(locale: string): Promise<NoticeItem[]> {
  const data = await sanityFetch<SanityNotice[]>(noticesQuery, { locale });

  if (!data || data.length === 0) return [];

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
  position?: number;
  total?: number;
}

/* ─── Detail Fetch Functions ─── */

export async function getPressDetail(
  slug: string,
  locale: string,
): Promise<{
  article: ArticleDetail;
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
  position?: number;
  total?: number;
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
    position: data.position,
    total: data.total,
  };
}

export type BlogDetailResult = {
  article: {
    _id: string;
    slug: string;
    title: string;
    date: string;
    content: PortableTextBlock[];
  };
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
  position?: number;
  total?: number;
};

interface SanityBlogDetail {
  _id: string;
  title?: string;
  slug?: string;
  content?: PortableTextBlock[];
  publishDate?: string;
  prevArticle?: { slug?: string; _id?: string; title?: string };
  nextArticle?: { slug?: string; _id?: string; title?: string };
  position?: number;
  total?: number;
}

export async function getBlogDetail(
  slug: string,
  locale: string,
): Promise<BlogDetailResult | null> {
  const data = await sanityFetch<SanityBlogDetail>(blogPostDetailQuery, {
    slug,
    locale,
  });

  if (!data || !data.title) return null;

  return {
    article: {
      _id: data._id,
      slug: data.slug || data._id,
      title: data.title,
      date: formatDate(data.publishDate),
      content: data.content || [],
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
    position: data.position,
    total: data.total,
  };
}

export async function getNoticeDetail(
  slug: string,
  locale: string,
): Promise<{
  article: ArticleDetail;
  prevArticle: ArticleNav;
  nextArticle: ArticleNav;
  position?: number;
  total?: number;
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
    position: data.position,
    total: data.total,
  };
}
