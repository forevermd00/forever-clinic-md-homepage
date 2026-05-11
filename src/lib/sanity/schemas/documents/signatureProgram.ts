import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'signatureProgram',
  title: '시그니처 프로그램',
  type: 'document',

  preview: {
    select: { name: 'name.ko', sortOrder: 'sortOrder' },
    prepare({ name, sortOrder }) {
      return {
        title: name || '(이름 미입력)',
        subtitle: `순서 ${sortOrder ?? 0}`,
      };
    },
  },

  fields: [
    defineField({
      name: 'name',
      title: '프로그램명',
      type: 'localizedString',
    }),
    defineField({
      name: 'keywords',
      title: '타깃 키워드',
      description: '짧게 · 로 구분 (예: 강한 리프팅 · 턱라인)',
      type: 'localizedString',
    }),
    defineField({
      name: 'position',
      title: '포지션 설명',
      description: '카드에 표시되는 한 줄 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'originalPrice',
      title: '정가 (원)',
      type: 'number',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'discountedPrice',
      title: '할인가 (원)',
      type: 'number',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'discountRate',
      title: '할인율 (%)',
      type: 'number',
      validation: (rule) => rule.min(0).max(100).integer(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: { source: 'name.ko', maxLength: 96 },
    }),
    defineField({
      name: 'description',
      title: '상세 설명',
      description: '상세 페이지에 표시되는 긴 설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'composition',
      title: '구성 시술',
      description: '어떤 시술들이 포함되는지 설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'isVisible',
      title: '홈페이지 노출',
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
