import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'eventPopup',
  title: '이벤트 팝업',
  type: 'document',

  preview: {
    select: { title: 'title.ko', startDate: 'startDate', endDate: 'endDate' },
    prepare({ title, startDate, endDate }) {
      const subtitle =
        startDate && endDate ? `${startDate} ~ ${endDate}` : startDate || '';
      return { title: title || '(제목 미입력)', subtitle };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: '팝업 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'image',
      title: '팝업 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'localizedText',
    }),
    defineField({
      name: 'linkUrl',
      title: '링크 URL',
      description: '팝업 클릭 시 이동할 URL 또는 경로',
      type: 'string',
    }),
    defineField({
      name: 'startDate',
      title: '시작일시',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: '종료일시',
      type: 'datetime',
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      description: '체크 해제 시 팝업이 표시되지 않습니다',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
