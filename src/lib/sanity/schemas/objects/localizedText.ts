import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'text',
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'text',
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'text',
    }),
  ],
});
