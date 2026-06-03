import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'priceOption',
  title: '가격 옵션',
  type: 'object',
  preview: {
    select: {
      name: 'name.ko',
      caption: 'caption.ko',
      area: 'area',
      price: 'price',
      discountPrice: 'discountPrice',
      isEvent: 'isEvent',
    },
    prepare({ name, caption, area, price, discountPrice, isEvent }) {
      const priceText = discountPrice
        ? `${discountPrice?.toLocaleString()}원 (정가 ${price?.toLocaleString()}원)`
        : price
          ? `${price.toLocaleString()}원`
          : '';
      const prefix = isEvent ? '[EVENT] ' : '';
      const areaText = area ? `${area} · ` : '';
      return {
        title: `${prefix}${areaText}${name || '(옵션명 미입력)'}`,
        subtitle: caption ? `${caption} — ${priceText}` : priceText,
      };
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: '옵션명',
      description: '예: "전체 얼굴 300샷", "침샘보톡스 (국산)"',
      type: 'localizedString',
    }),
    defineField({
      name: 'caption',
      title: '보조 설명',
      description: '용량·횟수 등 작은 회색 텍스트 (예: "300샷 / 1회")',
      type: 'localizedString',
    }),
    defineField({
      name: 'area',
      title: '부위 그룹',
      description:
        '같은 부위끼리 묶어 표시할 때 사용 (예: 얼굴 / 눈가 / 바디 / 여성 / 남성). 비워두면 그룹 없이 나열.',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: '가격(원, 부가세 별도)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'discountPrice',
      title: '할인 가격(원)',
      description: '이벤트/할인 적용 시에만 입력하세요',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'isEvent',
      title: '이벤트 옵션',
      description: '체크 시 [EVENT] 뱃지를 표시합니다',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
