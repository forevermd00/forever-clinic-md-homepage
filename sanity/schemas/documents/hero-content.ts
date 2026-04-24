import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'heroContent',
  title: 'Hero 콘텐츠',
  type: 'document',
  fields: [
    defineField({
      name: 'mainVideo',
      title: '메인 Hero 배경 영상',
      type: 'file',
      options: { accept: 'video/mp4' },
    }),
    defineField({
      name: 'mainFallbackImage',
      title: '메인 Hero Fallback 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'mainTitle',
      title: '메인 슬로건 (H1)',
      type: 'localizedString',
    }),
    defineField({
      name: 'mainSubtitle',
      title: '서브 슬로건',
      type: 'localizedString',
    }),
    defineField({
      name: 'pageHeroes',
      title: '페이지별 타이틀 Hero',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'pageKey',
              title: '페이지',
              type: 'string',
              options: {
                list: [
                  'before-after',
                  'treatments',
                  'promotions',
                  'brand',
                  'media',
                  'contact',
                  'estimate',
                  'login',
                  'signup',
                ],
              },
            }),
            defineField({
              name: 'title',
              title: '타이틀',
              type: 'localizedString',
            }),
            defineField({
              name: 'subtitle',
              title: '서브타이틀',
              type: 'localizedString',
            }),
          ],
        },
      ],
    }),
  ],
});
