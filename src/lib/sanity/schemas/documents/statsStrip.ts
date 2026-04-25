import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'statsStrip',
  title: 'Stats Strip',
  type: 'document',

  fields: [
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localizedString',
            }),
            defineField({
              name: 'number',
              title: 'Number',
              type: 'number',
            }),
            defineField({
              name: 'unit',
              title: 'Unit',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
});
