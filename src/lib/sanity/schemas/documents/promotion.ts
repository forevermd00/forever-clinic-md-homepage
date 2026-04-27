import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'promotion',
  title: '프로모션/이벤트',
  type: 'document',
  preview: {
    select: { title: 'title.ko', startDate: 'startDate', endDate: 'endDate' },
    prepare({ title, startDate, endDate }) {
      const subtitle =
        startDate && endDate ? `${startDate} ~ ${endDate}` : startDate || '';
      return { title: title || '(제목 미입력)', subtitle };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: '이벤트 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'image',
      title: '이벤트 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'treatment',
      title: '대상 시술',
      description: '할인 적용될 시술을 선택하세요',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({
      name: 'eventPrice',
      title: '이벤트 가격',
      description: '원 단위로 입력하세요',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'startDate',
      title: '시작일',
      type: 'date',
    }),
    defineField({
      name: 'endDate',
      title: '종료일',
      type: 'date',
    }),
    defineField({
      name: 'description',
      title: '이벤트 설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'showOnMain',
      title: '메인 노출',
      description: '홈페이지 메인에 표시합니다',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
