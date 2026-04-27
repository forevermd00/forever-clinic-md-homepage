import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'quickEntryCard',
  title: '빠른 탐색 카드',
  type: 'document',
  preview: {
    select: { title: 'title.ko', subtitle: 'tab' },
    prepare({ title, subtitle }) {
      const tabLabels: Record<string, string> = {
        concern: '고민별',
        situation: '상황별',
        treatment: '시술별',
      };
      return {
        title: title || '(제목 미입력)',
        subtitle: tabLabels[subtitle] || subtitle,
      };
    },
  },
  fields: [
    defineField({
      name: 'tab',
      title: '탭 분류',
      type: 'string',
      options: {
        list: [
          { title: '고민별', value: 'concern' },
          { title: '상황별', value: 'situation' },
          { title: '시술별', value: 'treatment' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: '카드 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: '카드 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'icon',
      title: '아이콘',
      type: 'image',
    }),
    defineField({
      name: 'linkUrl',
      title: '링크 URL',
      description: '카드 클릭 시 이동할 경로 (예: /treatments/lifting)',
      type: 'string',
    }),
    defineField({
      name: 'linkedTreatments',
      title: '연결 시술',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'treatment' }],
        }),
      ],
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
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
