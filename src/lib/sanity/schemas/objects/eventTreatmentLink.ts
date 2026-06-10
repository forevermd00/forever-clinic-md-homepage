import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'eventTreatmentLink',
  title: '연결 이벤트 시술',
  type: 'object',
  fields: [
    defineField({
      name: 'treatment',
      title: '시술',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({
      name: 'optionKeys',
      title: '선택 옵션 (priceOption _key)',
      description: '상세페이지에 노출할 가격 옵션 키 목록. 비우면 노출 안 함.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { title: 'treatment.name.ko' },
    prepare({ title }) {
      return { title: title || '(시술)' };
    },
  },
});
