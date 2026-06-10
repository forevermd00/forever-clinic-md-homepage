import { defineType, defineField } from 'sanity';

const localeImageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
  });

export default defineType({
  name: 'localizedImage',
  title: '다국어 이미지',
  type: 'object',
  fields: [
    localeImageField('ko', '한국어'),
    localeImageField('en', 'English'),
    localeImageField('zh', '中文'),
    localeImageField('ja', '日本語'),
  ],
});
