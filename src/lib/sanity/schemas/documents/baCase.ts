import { defineType, defineField } from 'sanity';

const CATEGORY_OPTIONS = [
  { title: '리프팅·레이저', value: 'lifting-laser' },
  { title: '쁘띠·실리프팅', value: 'petit-lifting' },
  { title: '피부 관리', value: 'skincare' },
  { title: '스킨부스터', value: 'skin-booster' },
  { title: '제모', value: 'hair-removal' },
  { title: '마취', value: 'anesthesia' },
];

export default defineType({
  name: 'baCase',
  title: 'Before & After 사례',
  type: 'document',
  preview: {
    select: {
      titleKo: 'title.ko',
      titleEn: 'title.en',
      subtitle: 'sessions',
      media: 'afterImage',
    },
    prepare({ titleKo, titleEn, subtitle, media }) {
      return {
        title: titleKo || titleEn || '(제목 없음)',
        subtitle: subtitle ? `${subtitle}회 시술` : '',
        media,
      };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      description: '리스트에 표시되는 제목 (언어별 입력)',
      type: 'localizedString',
    }),
    defineField({
      name: 'categories',
      title: '카테고리',
      description: '복수 선택 가능',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: CATEGORY_OPTIONS,
      },
    }),
    defineField({
      name: 'beforeImage',
      title: 'Before 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'afterImage',
      title: 'After 이미지',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sessions',
      title: '시술 횟수',
      type: 'number',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'elapsed',
      title: '경과 기간',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'showOnMain',
      title: '메인 노출',
      description: '홈페이지 메인에 표시합니다',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
