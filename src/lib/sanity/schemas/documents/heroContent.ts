import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'heroContent',
  title: '히어로 배너',
  type: 'document',

  preview: {
    prepare() {
      return { title: '포에버 클리닉 명동 — 히어로 배너 설정' };
    },
  },

  fields: [
    defineField({
      name: 'mainVideo',
      title: '메인 영상',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
    }),
    defineField({
      name: 'mainFallbackImage',
      title: '대체 이미지',
      description: '영상을 재생할 수 없는 경우 표시됩니다',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'mainTitle',
      title: '메인 타이틀',
      type: 'localizedString',
    }),
    defineField({
      name: 'mainSubtitle',
      title: '메인 서브타이틀',
      type: 'localizedString',
    }),
    defineField({
      name: 'pageHeroes',
      title: '페이지별 히어로',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {
            select: { title: 'title.ko', subtitle: 'pageKey' },
            prepare({ title, subtitle }) {
              return {
                title: title || '(제목 미입력)',
                subtitle: subtitle || '',
              };
            },
          },
          fields: [
            defineField({
              name: 'pageKey',
              title: '페이지 키',
              description: '예: before-after, treatments, brand',
              type: 'string',
              validation: (rule) => rule.required(),
              options: {
                list: [
                  { title: 'Before & After', value: 'before-after' },
                  { title: '시술 안내', value: 'treatments' },
                  { title: '브랜드', value: 'brand' },
                  { title: '프로모션', value: 'promotions' },
                  { title: '보도자료', value: 'press' },
                  { title: '영상 콘텐츠', value: 'video' },
                  { title: '블로그', value: 'blog' },
                  { title: '공지사항', value: 'notice' },
                  { title: '견적', value: 'estimate' },
                  { title: '예약/상담', value: 'contact' },
                ],
              },
            }),
            defineField({
              name: 'title',
              title: '제목',
              type: 'localizedString',
            }),
            defineField({
              name: 'subtitle',
              title: '부제목',
              type: 'localizedString',
            }),
            defineField({
              name: 'heroImage',
              title: '히어로 배경 이미지',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
        }),
      ],
    }),
  ],
});
