import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'facility',
  title: '시설 안내',
  type: 'document',
  preview: {
    select: { title: 'name.ko', media: 'image' },
  },
  fields: [
    defineField({
      name: 'name',
      title: '시설명',
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
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
