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
      name: 'content',
      title: '본문',
      type: 'localizedText',
    }),
    defineField({
      name: 'publishDate',
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
