import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'legalSection',
  title: '조항',
  type: 'object',
  preview: {
    select: { title: 'title.ko' },
  },
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: '본문',
      type: 'localizedSimpleText',
    }),
  ],
});
