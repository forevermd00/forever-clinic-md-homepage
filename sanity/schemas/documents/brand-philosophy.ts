import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'brandPhilosophy',
  title: '브랜드 철학',
  type: 'document',
  fields: [
    defineField({
      name: 'values',
      title: '핵심 가치',
      type: 'array',
      of: [
        {
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
              name: 'backgroundImage',
              title: '배경 이미지',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
        },
      ],
    }),
    defineField({ name: 'slogan', title: '슬로건', type: 'localizedString' }),
  ],
});
