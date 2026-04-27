import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'businessHours',
  title: '진료 시간',
  type: 'object',
  preview: {
    select: { day: 'day.ko', open: 'open', close: 'close' },
    prepare({ day, open, close }) {
      return {
        title: day || '(요일 미입력)',
        subtitle: open && close ? `${open} ~ ${close}` : '',
      };
    },
  },
  fields: [
    defineField({
      name: 'day',
      title: '요일',
      type: 'localizedString',
    }),
    defineField({
      name: 'open',
      title: '오픈 시간',
      description: '예: 09:00',
      type: 'string',
    }),
    defineField({
      name: 'close',
      title: '마감 시간',
      description: '예: 18:00',
      type: 'string',
    }),
    defineField({
      name: 'note',
      title: '비고',
      description: '점심시간, 휴진 등 참고 사항',
      type: 'localizedString',
    }),
  ],
});
