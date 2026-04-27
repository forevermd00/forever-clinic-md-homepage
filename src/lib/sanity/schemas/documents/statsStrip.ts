import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'statsStrip',
  title: '통계 수치',
  type: 'document',

  preview: {
    prepare() {
      return { title: '포에버 클리닉 명동 — 메인 통계 수치' };
    },
  },

  fields: [
    defineField({
      name: 'stats',
      title: '통계 항목',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {
            select: { label: 'label.ko', number: 'number', unit: 'unit' },
            prepare({ label, number, unit }) {
              return {
                title: label || '(항목명 미입력)',
                subtitle: number != null ? `${number}${unit || ''}` : '',
              };
            },
          },
          fields: [
            defineField({
              name: 'label',
              title: '항목명',
              description: '예: 누적 시술 건수',
              type: 'localizedString',
            }),
            defineField({
              name: 'number',
              title: '숫자',
              type: 'number',
              validation: (rule) => rule.min(0),
            }),
            defineField({
              name: 'unit',
              title: '단위',
              description: '예: 건, 명, 년',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
});
