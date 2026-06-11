import { defineType, defineField, defineArrayMember } from 'sanity';

const localeImageArrayField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    options: { layout: 'grid' },
  });

export default defineType({
  name: 'localizedImageArray',
  title: '다국어 이미지 묶음',
  type: 'object',
  description:
    '언어별로 상세 이미지를 여러 장 업로드할 수 있습니다 (세로로 쌓여 표시됨)',
  fields: [
    localeImageArrayField('ko', '한국어'),
    localeImageArrayField('en', 'English'),
    localeImageArrayField('zh', '中文'),
    localeImageArrayField('ja', '日本語'),
  ],
});
