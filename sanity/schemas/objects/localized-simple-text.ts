import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'localizedSimpleText',
  title: 'Localized Simple Text',
  type: 'object',
  fields: [
    defineField({ name: 'ko', title: '한국어', type: 'text' }),
    defineField({ name: 'en', title: 'English', type: 'text' }),
  ],
});
