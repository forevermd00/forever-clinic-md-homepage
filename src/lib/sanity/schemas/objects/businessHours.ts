import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'businessHours',
  title: 'Business Hours',
  type: 'object',
  fields: [
    defineField({
      name: 'day',
      title: 'Day',
      type: 'localizedString',
    }),
    defineField({
      name: 'open',
      title: 'Open',
      type: 'string',
    }),
    defineField({
      name: 'close',
      title: 'Close',
      type: 'string',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'localizedString',
    }),
  ],
});
