import { defineType, defineField, defineArrayMember } from 'sanity';

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
      name: 'slogan',
      title: '슬로건',
      type: 'localizedString',
    }),
    defineField({
      name: 'badge',
      title: '배지 텍스트',
      description: '예: Since 2008',
      type: 'string',
      initialValue: 'BRAND PHILOSOPHY · Since 2008',
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
    defineField({
      name: 'values',
      title: '브랜드 가치',
      description: '정직, 정교, 전문, 존엄 등 브랜드 핵심 가치',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: '가치명',
              type: 'localizedString',
            }),
            defineField({
              name: 'description',
              title: '설명',
              type: 'localizedString',
            }),
            defineField({
              name: 'image',
              title: '이미지',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'title.ko', subtitle: 'title.en' },
          },
        }),
      ],
    }),
  ],
});
