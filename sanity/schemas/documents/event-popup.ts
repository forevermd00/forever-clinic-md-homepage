import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'eventPopup',
  title: '이벤트 팝업',
  type: 'document',
  fields: [
    defineField({
      name: 'isActive',
      title: '팝업 활성화',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'image',
      title: '팝업 이미지',
      type: 'localizedImage',
    }),
    defineField({ name: 'title', title: '팝업 제목', type: 'localizedString' }),
    defineField({
      name: 'description',
      title: '팝업 설명',
      type: 'localizedString',
    }),
    defineField({
      name: 'linkedPromotion',
      title: '연결 프로모션',
      type: 'reference',
      to: [{ type: 'promotion' }],
    }),
    defineField({
      name: 'targetLocales',
      title: '노출 대상 언어',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['ko', 'en', 'zh', 'ja'] },
    }),
    defineField({
      name: 'enableDismiss',
      title: '오늘 하루 안 보기',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
