import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'promotion',
  title: '프로모션',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '프로모션 제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: '프로모션 이미지',
      type: 'localizedImage',
    }),
    defineField({
      name: 'treatment',
      title: '대상 시술',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({ name: 'eventPrice', title: '이벤트 가격', type: 'number' }),
    defineField({
      name: 'startDate',
      title: '시작일',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: '종료일',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: '프로모션 설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'showOnMain',
      title: '메인 노출 여부',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: { select: { title: 'title.ko', subtitle: 'startDate' } },
});
