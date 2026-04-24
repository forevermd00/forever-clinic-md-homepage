import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: '블로그',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: { source: 'title.en', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'excerpt', title: '발췌', type: 'localizedString' }),
    defineField({ name: 'body', title: '본문', type: 'localizedText' }),
    defineField({ name: 'category', title: '카테고리', type: 'string' }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'date' }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
