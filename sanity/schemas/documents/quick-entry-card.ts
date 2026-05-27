import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'quickEntryCard',
  title: 'Quick Entry 카드',
  type: 'document',
  fields: [
    defineField({
      name: 'tab',
      title: '탭',
      type: 'reference',
      to: [{ type: 'quickEntryTab' }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: '카드 제목', type: 'localizedString' }),
    defineField({
      name: 'description',
      title: '카드 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'slug',
      title: '슬러그',
      type: 'slug',
      description: '설정 시 /treatments/{slug} 페이지로 연결됩니다',
      options: { source: 'title.ko' },
    }),
    defineField({ name: 'icon', title: '아이콘/이미지', type: 'image' }),
    defineField({
      name: 'linkedTreatments',
      title: '연결 시술',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'treatment' }] }],
      description: '이 카드 클릭 시 표시할 시술 목록',
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
});
