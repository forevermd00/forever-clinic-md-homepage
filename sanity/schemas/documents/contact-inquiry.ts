import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'contactInquiry',
  title: '상담 문의',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: '이름', type: 'string' }),
    defineField({ name: 'phone', title: '연락처', type: 'string' }),
    defineField({ name: 'email', title: '이메일', type: 'string' }),
    defineField({
      name: 'selectedTreatments',
      title: '관심 시술',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'treatment',
              title: '시술',
              type: 'reference',
              to: [{ type: 'treatment' }],
            }),
            defineField({
              name: 'priceOptionLabel',
              title: '선택 옵션',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({ name: 'message', title: '문의 내용', type: 'text' }),
    defineField({ name: 'locale', title: '문의 언어', type: 'string' }),
    defineField({
      name: 'source',
      title: '문의 출처',
      type: 'string',
      options: { list: ['contact-page', 'floating-cta', 'estimate-page'] },
    }),
    defineField({
      name: 'status',
      title: '상태',
      type: 'string',
      options: { list: ['new', 'confirmed', 'consulted', 'booked'] },
      initialValue: 'new',
    }),
    defineField({ name: 'submittedAt', title: '제출일시', type: 'datetime' }),
  ],
  orderings: [
    {
      title: '최신순',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
});
