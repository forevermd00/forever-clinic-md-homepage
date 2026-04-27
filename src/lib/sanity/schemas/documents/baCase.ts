import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'baCase',
  title: 'Before & After 사례',
  type: 'document',
  preview: {
    select: {
      title: 'treatment.name.ko',
      subtitle: 'sessions',
      media: 'afterImage',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || '(시술 미선택)',
        subtitle: subtitle ? `${subtitle}회 시술` : '',
        media,
      };
    },
  },
  fields: [
    defineField({
      name: 'beforeImage',
      title: 'Before 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'afterImage',
      title: 'After 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'treatment',
      title: '시술',
      description: '해당 사례의 시술을 선택하세요',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({
      name: 'sessions',
      title: '시술 횟수',
      type: 'number',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'elapsed',
      title: '경과 기간',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: '설명',
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
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
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
