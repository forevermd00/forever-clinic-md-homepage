import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'equipment',
  title: '장비 안내',
  type: 'document',
  preview: {
    select: { title: 'name.ko', subtitle: 'manufacturer', media: 'image' },
  },
  fields: [
    orderRankField({ type: 'equipment' }),
    defineField({
      name: 'name',
      title: '장비명',
      type: 'localizedString',
    }),
    defineField({
      name: 'image',
      title: '이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'manufacturer',
      title: '제조사',
      type: 'string',
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
