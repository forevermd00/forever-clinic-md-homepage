import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'priceOption',
  title: '가격 옵션',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: '옵션명',
      type: 'localizedString',
      description: '예: "1회", "3회 패키지", "3회+스킨부스터"',
    }),
    defineField({ name: 'price', title: '가격', type: 'number' }),
    defineField({
      name: 'discountPrice',
      title: '할인가',
      type: 'number',
      description: '이벤트 시 적용. 미입력 시 정가 노출',
    }),
  ],
});
