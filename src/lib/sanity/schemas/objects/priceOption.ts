import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'priceOption',
  title: 'Price Option',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localizedString',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
    }),
    defineField({
      name: 'discountPrice',
      title: 'Discount Price',
      type: 'number',
    }),
  ],
});
