import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'quickEntryCard',
  title: 'Quick Entry Card',
  type: 'document',
  fields: [
    defineField({
      name: 'tab',
      title: 'Tab',
      type: 'string',
      options: {
        list: [
          { title: 'Concern', value: 'concern' },
          { title: 'Situation', value: 'situation' },
          { title: 'Treatment', value: 'treatment' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedString',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
    }),
    defineField({
      name: 'linkedTreatments',
      title: 'Linked Treatments',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'treatment' }],
        }),
      ],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
    }),
    defineField({
      name: 'isVisible',
      title: 'Is Visible',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
