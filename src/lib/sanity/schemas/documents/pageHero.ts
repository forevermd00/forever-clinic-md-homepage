import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pageHero',
  title: '페이지 히어로',
  type: 'document',

  preview: {
    select: { pageName: 'pageName', titleKo: 'title.ko' },
    prepare({ pageName, titleKo }) {
      return { title: pageName || titleKo || '히어로' };
    },
  },

  fields: [
    defineField({
      name: 'pageName',
      title: '페이지',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: '제목',
      description: '줄바꿈이 필요하면 Enter를 누르세요',
      type: 'localizedText',
    }),
    defineField({
      name: 'subtitle',
      title: '부제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'heroImage',
      title: '배경 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroVideo',
      title: '배경 영상',
      description: '메인 페이지 전용. 영상이 있으면 이미지 대신 재생됩니다.',
      type: 'file',
      options: { accept: 'video/mp4' },
    }),
  ],
});
