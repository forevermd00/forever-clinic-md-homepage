import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'quickEntryTab',
  title: '빠른 탐색 탭',
  type: 'document',
  preview: {
    select: { title: 'label.ko', subtitle: 'key' },
    prepare({ title, subtitle }) {
      return {
        title: title || '(이름 미입력)',
        subtitle: `key: ${subtitle}`,
      };
    },
  },
  fields: [
    defineField({
      name: 'key',
      title: '탭 키',
      description: '시스템 식별자 (영문, 수정 시 주의)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: '탭 이름',
      description: '화면에 표시되는 탭 이름',
      type: 'localizedString',
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 왼쪽에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
