import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'notice',
  title: '공지사항',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: '카테고리',
      type: 'string',
      options: { list: ['운영안내', '휴진', '이벤트', '기타'] },
    }),
    defineField({ name: 'body', title: '본문', type: 'localizedText' }),
    defineField({ name: 'publishedAt', title: '게시일', type: 'date' }),
    defineField({
      name: 'isPinned',
      title: '상단 고정',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
