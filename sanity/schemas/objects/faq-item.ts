import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'object',
  fields: [
    defineField({ name: 'question', title: '질문', type: 'localizedString' }),
    defineField({ name: 'answer', title: '답변', type: 'localizedString' }),
  ],
});
