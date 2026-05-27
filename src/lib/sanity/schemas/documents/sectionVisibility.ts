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
        defineField({
          name: 'brandPhilosophy',
          title: '브랜드 철학',
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
      name: 'contact',
      title: '상담 폼 설정',
      type: 'object',
      fields: [
        defineField({
          name: 'showPreferredDatetime',
          title: '희망 예약 일시 표시',
          description: '꺼두면 상담 폼에서 날짜/시간 선택 항목이 숨겨집니다.',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
    defineField({
      name: 'treatments',
      title: '시술 페이지 설정',
      type: 'object',
      fields: [
        defineField({
          name: 'detail',
          title: '시술 상세 페이지',
          description:
            '꺼두면 시술 상세 페이지 접근 시 시술 목록 페이지로 이동합니다.',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'showPrice',
          title: '가격 표시',
          description: '꺼두면 시술 카드와 상세 페이지에서 가격이 숨겨집니다.',
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
    defineField({
      name: 'navOrder',
      title: '메뉴 노출 순서',
      description: '메뉴 항목 표시 순서 (비워두면 기본 순서)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'megaMenuOrder',
      title: '메가메뉴 시술 카테고리 순서',
      description: '시술 카테고리 표시 순서 (비워두면 기본 순서)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'homeOrder',
      title: '메인 홈 섹션 순서',
      description: '섹션 표시 순서 (비워두면 기본 순서)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'brandOrder',
      title: '브랜드 페이지 섹션 순서',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'mediaOrder',
      title: '미디어 탭 순서',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    prepare: () => ({ title: '섹션 노출 설정' }),
  },
});
