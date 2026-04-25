import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'baCase',
  title: 'Before & After Case',
  type: 'document',
  fields: [
    defineField({
      name: 'beforeImage',
      title: 'Before Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'afterImage',
      title: 'After Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'treatment',
      title: 'Treatment',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({
      name: 'sessions',
      title: 'Sessions',
      type: 'number',
    }),
    defineField({
      name: 'elapsed',
      title: 'Elapsed',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedText',
    }),
    defineField({
      name: 'showOnMain',
      title: 'Show on Main',
      type: 'boolean',
    }),
    defineField({
      name: 'isVisible',
      title: 'Is Visible',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
    }),
  ],
});
