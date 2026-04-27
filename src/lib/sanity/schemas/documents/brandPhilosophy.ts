import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'brandPhilosophy',
  title: '브랜드 철학',
  type: 'document',

  preview: {
    prepare() {
      return { title: '포에버 클리닉 명동 — 브랜드 철학' };
    },
  },

  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'subtitle',
      title: '부제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'backgroundImage',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'content',
      title: '본문',
      type: 'localizedText',
    }),
  ],
});
