import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'facility',
  title: '시설/인테리어',
  type: 'document',
  fields: [
    orderRankField({ type: 'facility' }),
    defineField({ name: 'name', title: '공간명', type: 'localizedString' }),
    defineField({
      name: 'image',
      title: '이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
});
