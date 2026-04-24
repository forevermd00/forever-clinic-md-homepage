import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'quickEntryCard',
  title: 'Quick Entry 카드',
  type: 'document',
  fields: [
    defineField({
      name: 'tab',
      title: '탭',
      type: 'string',
      options: {
        list: [
          { title: '시술로 찾기', value: 'treatment' },
          { title: '고민으로 찾기', value: 'concern' },
          { title: '상황으로 찾기', value: 'situation' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'title', title: '카드 제목', type: 'localizedString' }),
    defineField({
      name: 'description',
      title: '카드 설명',
      type: 'localizedString',
    }),
    defineField({ name: 'icon', title: '아이콘/이미지', type: 'image' }),
    defineField({
      name: 'linkUrl',
      title: '연결 URL',
      type: 'string',
      description: '예: /treatments?cat=lifting, /treatments?concern=wrinkle',
    }),
    defineField({
      name: 'linkedTreatments',
      title: '연결 시술',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'treatment' }] }],
      description: '이 카드 클릭 시 표시할 시술 목록 (고민/상황 탭용)',
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
});
