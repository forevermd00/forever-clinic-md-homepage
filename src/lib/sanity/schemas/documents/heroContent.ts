import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'heroContent',
  title: 'Hero Content',
  type: 'document',

  fields: [
    defineField({
      name: 'mainVideo',
      title: 'Main Video',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
    }),
    defineField({
      name: 'mainFallbackImage',
      title: 'Main Fallback Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'mainTitle',
      title: 'Main Title',
      type: 'localizedString',
    }),
    defineField({
      name: 'mainSubtitle',
      title: 'Main Subtitle',
      type: 'localizedString',
    }),
    defineField({
      name: 'pageHeroes',
      title: 'Page Heroes',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'pageKey',
              title: 'Page Key',
              type: 'string',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'localizedString',
            }),
            defineField({
              name: 'subtitle',
              title: 'Subtitle',
              type: 'localizedString',
            }),
          ],
        }),
      ],
    }),
  ],
});
