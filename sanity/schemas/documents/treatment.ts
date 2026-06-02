import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'treatment',
  title: '시술',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '시술명',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: { source: 'name.en', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: '한 줄 정의',
      type: 'localizedString',
    }),
    defineField({
      name: 'category',
      title: '카테고리',
      type: 'string',
      options: {
        list: [
          { title: '시그니처', value: 'signature' },
          { title: '리프팅·레이저', value: 'lifting-laser' },
          { title: '쁘띠 & 실리프팅', value: 'petit-lifting' },
          { title: '피부 관리', value: 'skincare' },
          { title: '스킨부스터', value: 'skin-booster' },
          { title: '제모', value: 'hair-removal' },
          { title: '마취', value: 'anesthesia' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: '대표 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'detailImage',
      title: '상세 이미지',
      type: 'localizedImage',
    }),
    defineField({
      name: 'keywords',
      title: '키워드 (태그)',
      description: '시그니처 카드에 표시되는 태그. 가운데점(·)으로 구분.',
      type: 'localizedString',
    }),
    defineField({
      name: 'effects',
      title: '주요 효과',
      type: 'array',
      of: [{ type: 'localizedString' }],
    }),
    defineField({
      name: 'duration',
      title: '지속 기간',
      type: 'localizedString',
    }),
    defineField({
      name: 'downtime',
      title: '다운타임',
      type: 'localizedString',
    }),
    defineField({
      name: 'treatmentTime',
      title: '시술 시간',
      type: 'localizedString',
    }),
    defineField({
      name: 'priceOptions',
      title: '가격 옵션',
      type: 'array',
      of: [{ type: 'priceOption' }],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [{ type: 'faqItem' }],
    }),
    defineField({
      name: 'relatedTreatments',
      title: '관련 시술',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'treatment' }] }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'isEvent',
      title: '이벤트 진행 여부',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showOnMain',
      title: '메인 홈에 표시',
      description: 'isEvent가 true일 때, 메인 홈 이벤트 섹션에 노출할지 여부',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'eventStartDate',
      title: '이벤트 시작일',
      description: '이벤트 기간 시작일 (isEvent가 true일 때만 사용)',
      type: 'date',
    }),
    defineField({
      name: 'eventEndDate',
      title: '이벤트 종료일',
      description: '이벤트 기간 종료일',
      type: 'date',
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: '노출 순서',
      name: 'sortOrderAsc',
      by: [{ field: 'sortOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name.ko', subtitle: 'category', media: 'thumbnail' },
  },
});
