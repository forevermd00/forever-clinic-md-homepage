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
              name: 'titleKo',
              title: '가치 (한글)',
              type: 'string',
            }),
            defineField({
              name: 'titleEn',
              title: '가치 (영문)',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: '설명',
              type: 'localizedText',
            }),
            defineField({
              name: 'image',
              title: '이미지',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'titleKo', subtitle: 'titleEn' },
          },
        }),
      ],
    }),
  ],
});
