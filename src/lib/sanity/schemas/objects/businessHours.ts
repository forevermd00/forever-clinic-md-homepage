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
      name: 'dayOfWeek',
      title: '요일 (숫자)',
      description:
        '해당 영업시간이 적용되는 요일을 선택 (0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '일 (Sun)', value: '0' },
          { title: '월 (Mon)', value: '1' },
          { title: '화 (Tue)', value: '2' },
          { title: '수 (Wed)', value: '3' },
          { title: '목 (Thu)', value: '4' },
          { title: '금 (Fri)', value: '5' },
          { title: '토 (Sat)', value: '6' },
        ],
      },
    }),
    defineField({
      name: 'day',
      title: '요일 표시명',
      description: '진료시간 안내에 표시될 요일 텍스트 (예: 월~금, 토·일)',
      type: 'localizedString',
    }),
    defineField({
      name: 'open',
      title: '오픈 시간',
      description: '예: 10:00',
      type: 'string',
    }),
    defineField({
      name: 'close',
      title: '마감 시간',
      description: '예: 19:30',
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
