import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
});
