import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'notice',
  title: '공지사항',
  type: 'document',
  preview: {
    select: {
      title: 'title.ko',
      subtitle: 'publishDate',
      isPinned: 'isPinned',
    },
    prepare({ title, subtitle, isPinned }) {
      return {
        title: `${isPinned ? '[고정] ' : ''}${title || '(제목 미입력)'}`,
        subtitle: subtitle || '',
      };
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: '공지 제목',
      type: 'localizedString',
    }),
    defineField({
      name: 'content',
      title: '공지 내용',
      type: 'localizedText',
    }),
    defineField({
      name: 'publishDate',
      title: '게시일',
      type: 'date',
    }),
    defineField({
      name: 'isPinned',
      title: '상단 고정',
      description: '체크하면 목록 최상단에 표시됩니다',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
