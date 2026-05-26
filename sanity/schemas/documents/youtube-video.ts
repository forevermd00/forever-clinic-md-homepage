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
      name: 'displayLanguages',
      title: '표시 언어',
      description:
        '선택한 언어에서만 이 영상이 표시됩니다. 비어있으면 모든 언어에 표시.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '한국어', value: 'ko' },
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
          { title: '日本語', value: 'ja' },
        ],
      },
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
