import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'faqItem',
  title: 'FAQ 항목',
  type: 'object',
  preview: {
    select: { title: 'question.ko' },
    prepare({ title }) {
      return { title: title || '(질문 미입력)' };
    },
  },
  fields: [
    defineField({
      name: 'question',
      title: '질문',
      type: 'localizedString',
    }),
    defineField({
      name: 'answer',
      title: '답변',
      type: 'localizedText',
    }),
  ],
});
