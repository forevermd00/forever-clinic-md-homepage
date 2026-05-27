import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'baCase',
  title: 'Before & After',
  type: 'document',
  fields: [
    defineField({
      name: 'beforeImage',
      title: 'Before 이미지',
      type: 'image',
      validation: (rule) => rule.required(),
      description: '보정/필터 적용 이미지 사용 금지',
    }),
    defineField({
      name: 'afterImage',
      title: 'After 이미지',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'treatment',
      title: '연결 시술',
      type: 'reference',
      to: [{ type: 'treatment' }],
    }),
    defineField({
      name: 'sessions',
      title: '시술 회차',
      type: 'localizedString',
      description: '예: 3회 시술 후',
    }),
    defineField({
      name: 'elapsed',
      title: '경과 기간',
      type: 'localizedString',
      description: '예: 2개월 경과',
    }),
    defineField({
      name: 'title',
      title: '카드 제목',
      type: 'localizedString',
      description: '카드 하단에 표시되는 제목 (미입력 시 연결 시술명 사용)',
    }),
    defineField({
      name: 'description',
      title: '케이스 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'categories',
      title: '카테고리',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '리프팅', value: 'lifting' },
          { title: '피부케어', value: 'skincare' },
          { title: '토닝/색소', value: 'toning' },
          { title: '보톡스/필러', value: 'botox-filler' },
        ],
      },
    }),
    defineField({
      name: 'showOnMain',
      title: '메인 노출',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
