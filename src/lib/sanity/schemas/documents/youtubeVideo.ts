import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'youtubeVideo',
  title: '영상 콘텐츠',
  type: 'document',
  preview: {
    select: { title: 'title.ko', subtitle: 'publishDate', media: 'thumbnail' },
  },
  fields: [
    defineField({
      name: 'title',
      title: '영상 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube ID',
      description: 'YouTube 영상 URL에서 v= 뒤의 값 (썸네일 자동 생성에 사용)',
      type: 'string',
    }),
    defineField({
      name: 'youtubeUrl',
      title: '영상 링크 URL',
      description: '클릭 시 이동할 URL (Shorts, 시작 시간 등 커스텀 링크)',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'publishDate',
      title: '게시일',
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
