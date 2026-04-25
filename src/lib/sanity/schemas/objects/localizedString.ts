import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedString',
  title: 'Localized String',
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
