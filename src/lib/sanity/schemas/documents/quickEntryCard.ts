import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'quickEntryCard',
  title: '빠른 탐색 카드',
  type: 'document',
  preview: {
    select: { title: 'title.ko', tabLabel: 'tab.label.ko' },
    prepare({ title, tabLabel }) {
      return {
        title: title || '(제목 미입력)',
        subtitle: tabLabel || '',
      };
    },
  },
  fields: [
    defineField({
      name: 'tab',
      title: '탭 분류',
      description: '이 카드가 속하는 탭',
      type: 'reference',
      to: [{ type: 'quickEntryTab' }],
      validation: (rule) => rule.required(),
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
      title: '아이콘/이미지',
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
      description: '이 카드와 연결된 시술들',
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
