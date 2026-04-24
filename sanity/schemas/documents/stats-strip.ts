import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'statsStrip',
  title: '통계 수치',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: '통계 항목',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: '수치',
              type: 'localizedString',
              description: '예: 15+, 36,800+',
            }),
            defineField({
              name: 'label',
              title: '레이블',
              type: 'localizedString',
              description: '예: 시술 경력, 누적 시술',
            }),
          ],
        },
      ],
    }),
  ],
});
