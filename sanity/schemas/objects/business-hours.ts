import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'businessHours',
  title: 'Business Hours',
  type: 'object',
  fields: [
    defineField({ name: 'day', title: '요일', type: 'localizedString' }),
    defineField({
      name: 'open',
      title: '시작시간',
      type: 'string',
      description: '예: 10:00',
    }),
    defineField({
      name: 'close',
      title: '종료시간',
      type: 'string',
      description: '예: 19:00',
    }),
    defineField({
      name: 'note',
      title: '비고',
      type: 'localizedString',
      description: '예: 점심시간 13:00~14:00',
    }),
  ],
});
