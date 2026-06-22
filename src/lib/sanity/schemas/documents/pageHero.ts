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
      name: 'badge',
      title: '배지 문구 (예: Since 2009)',
      description: '제목 위 작은 강조 문구. 비워두면 숨겨집니다.',
      type: 'localizedString',
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
      name: 'backgroundType',
      title: '배경 선택',
      description:
        '이미지와 영상을 모두 올려도 여기서 선택한 것만 표시됩니다. (메인 페이지 전용)',
      type: 'string',
      options: {
        list: [
          { title: '배경 영상', value: 'video' },
          { title: '배경 이미지', value: 'image' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
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
      description: '메인 페이지 전용. mp4 파일을 업로드하세요.',
      type: 'file',
      options: { accept: 'video/mp4' },
    }),
  ],
});
