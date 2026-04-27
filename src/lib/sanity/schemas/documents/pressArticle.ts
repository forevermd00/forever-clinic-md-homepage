import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pressArticle',
  title: '보도자료',
  type: 'document',
  preview: {
    select: { title: 'title.ko', subtitle: 'source', media: 'thumbnail' },
  },
  fields: [
    defineField({
      name: 'title',
      title: '기사 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'source',
      title: '출처',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: '기사 URL',
      type: 'url',
    }),
    defineField({
      name: 'publishDate',
      title: '게재일',
      type: 'date',
    }),
    defineField({
      name: 'thumbnail',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
});
