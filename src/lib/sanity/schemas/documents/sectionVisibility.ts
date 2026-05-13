import { defineField, defineType } from 'sanity';

export const sectionVisibility = defineType({
  name: 'sectionVisibility',
  title: '섹션 노출 설정',
  type: 'document',
  fields: [
    defineField({
      name: 'nav',
      title: '메뉴 노출',
      type: 'object',
      fields: [
        defineField({
          name: 'bnA',
          title: 'B&A',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'treatments',
          title: '시술',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'brand',
          title: '브랜드',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'media',
          title: '미디어',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'home',
      title: '메인 홈페이지 섹션',
      type: 'object',
      fields: [
        defineField({
          name: 'hero',
          title: '히어로',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'quickEntry',
          title: '퀵엔트리',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'signature',
          title: '시그니처 프로그램',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'promo',
          title: '이벤트/프로모션',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'bnA',
          title: 'B&A 미리보기',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'stats',
          title: '통계 스트립',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'doctors',
          title: '의료진',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'location',
          title: '위치',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'contact',
          title: '문의',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'brand',
      title: '브랜드 페이지 탭',
      type: 'object',
      fields: [
        defineField({
          name: 'philosophy',
          title: '브랜드 철학',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'doctors',
          title: '의료진',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'facilities',
          title: '시설',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'equipment',
          title: '장비',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'location',
          title: '위치',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'media',
      title: '미디어 탭',
      type: 'object',
      fields: [
        defineField({
          name: 'press',
          title: '보도자료',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'video',
          title: '영상',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'blog',
          title: '블로그',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'notice',
          title: '공지사항',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: '섹션 노출 설정' }),
  },
});
