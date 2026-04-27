import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedString',
  title: '다국어 텍스트',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'string',
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'string',
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'string',
    }),
  ],
});
