import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pressArticle',
  title: '언론보도',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '기사 제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'publisher', title: '언론사', type: 'string' }),
    defineField({
      name: 'excerpt',
      title: '요약 (4개 언어)',
      type: 'localizedString',
    }),
    defineField({
      name: 'url',
      title: '기사 URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'date' }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'views',
      title: '조회수',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
  ],
});
