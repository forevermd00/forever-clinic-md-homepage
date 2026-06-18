import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blogPost',
  title: '블로그',
  type: 'document',
  preview: {
    select: { title: 'title.ko', subtitle: 'category', media: 'thumbnail' },
  },
  fields: [
    defineField({
      name: 'title',
      title: '글 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'slug',
      title: 'URL 주소',
      description: '영문으로 자동 생성됩니다',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'category',
      title: '카테고리',
      type: 'string',
    }),
    defineField({
      name: 'markdownContent',
      title: '본문 (마크다운)',
      description: '마크다운 문법으로 작성합니다. 관리자 도구에서 편집하세요.',
      type: 'localizedText',
    }),
    defineField({
      name: 'publishedAt',
      title: '게시일',
      type: 'date',
    }),
    defineField({
      name: 'thumbnail',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
