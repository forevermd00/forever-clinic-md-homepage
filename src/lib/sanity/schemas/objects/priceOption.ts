import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'priceOption',
  title: '가격 옵션',
  type: 'object',
  preview: {
    select: { name: 'name.ko', price: 'price', discountPrice: 'discountPrice' },
    prepare({ name, price, discountPrice }) {
      const priceText = discountPrice
        ? `${discountPrice?.toLocaleString()}원 (정가 ${price?.toLocaleString()}원)`
        : price
          ? `${price.toLocaleString()}원`
          : '';
      return {
        title: name || '(옵션명 미입력)',
        subtitle: priceText,
      };
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: '옵션명',
      type: 'localizedString',
    }),
    defineField({
      name: 'price',
      title: '가격(원)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'discountPrice',
      title: '할인 가격(원)',
      description: '할인 적용 시에만 입력하세요',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
  ],
});
