import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'equipment',
  title: '보유 장비',
  type: 'document',
  fields: [
    orderRankField({ type: 'equipment' }),
    defineField({ name: 'name', title: '장비명', type: 'localizedString' }),
    defineField({
      name: 'image',
      title: '장비 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: '용도 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'relatedTreatments',
      title: '연결 시술',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'treatment' }] }],
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
});
