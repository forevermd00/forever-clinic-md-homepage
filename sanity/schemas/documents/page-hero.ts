import { defineType, defineField } from 'sanity';

/**
 * 페이지별 히어로 섹션 (singleton 패턴)
 * _id 규칙: page-hero-{pageKey}
 * 예: page-hero-treatments, page-hero-before-after, page-hero-brand
 */
export default defineType({
  name: 'pageHero',
  title: '페이지 히어로',
  type: 'document',
  fields: [
    defineField({
      name: 'pageKey',
      title: '페이지 식별자',
      type: 'string',
      description: 'treatments | before-after | brand | media 등',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: '제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'subtitle',
      title: '부제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'heroImage',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'pageKey', subtitle: 'title.ko' },
    prepare({ title, subtitle }) {
      return { title: `히어로 — ${title}`, subtitle };
    },
  },
});
