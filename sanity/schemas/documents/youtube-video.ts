import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'youtubeVideo',
  title: 'YouTube 영상',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '영상 제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: '썸네일',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'duration',
      title: '재생시간',
      type: 'string',
      description: '예: 5:30',
    }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'date' }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
