import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'clinicInfo',
  title: 'Clinic Info',
  type: 'document',

  fields: [
    defineField({
      name: 'address',
      title: 'Address',
      type: 'localizedString',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'businessHours',
      title: 'Business Hours',
      type: 'array',
      of: [defineArrayMember({ type: 'businessHours' })],
    }),
    defineField({
      name: 'closedDayNotice',
      title: 'Closed Day Notice',
      type: 'localizedString',
    }),
    defineField({
      name: 'googleMapsEmbedUrl',
      title: 'Google Maps Embed URL',
      type: 'string',
    }),
    defineField({
      name: 'walkingGuide',
      title: 'Walking Guide',
      type: 'localizedText',
    }),
    defineField({
      name: 'snsLinks',
      title: 'SNS Links',
      type: 'array',
      of: [defineArrayMember({ type: 'snsLink' })],
    }),
    defineField({
      name: 'messengerLinks',
      title: 'Messenger Links',
      type: 'array',
      of: [defineArrayMember({ type: 'snsLink' })],
    }),
  ],
});
