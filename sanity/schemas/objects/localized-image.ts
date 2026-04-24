import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedImage',
  title: 'Localized Image',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
