import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'treatment',
  title: 'Treatment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localizedString',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name.en',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Lifting', value: 'lifting' },
          { title: 'Skincare', value: 'skincare' },
          { title: 'Toning', value: 'toning' },
          { title: 'Botox & Filler', value: 'botox-filler' },
        ],
      },
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'detailImages',
      title: 'Detail Images',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'localizedString',
    }),
    defineField({
      name: 'effects',
      title: 'Effects',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
    }),
    defineField({
      name: 'downtime',
      title: 'Downtime',
      type: 'string',
    }),
    defineField({
      name: 'treatmentTime',
      title: 'Treatment Time',
      type: 'string',
    }),
    defineField({
      name: 'priceOptions',
      title: 'Price Options',
      type: 'array',
      of: [defineArrayMember({ type: 'priceOption' })],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
    }),
    defineField({
      name: 'relatedTreatments',
      title: 'Related Treatments',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'treatment' }],
        }),
      ],
    }),
    defineField({
      name: 'isEvent',
      title: 'Is Event',
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
