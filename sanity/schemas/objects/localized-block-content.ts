import { defineType, defineField, defineArrayMember } from 'sanity';

const blockMember = defineArrayMember({
  type: 'block',
  styles: [
    { title: '본문', value: 'normal' },
    { title: '소제목', value: 'h3' },
    { title: '소소제목', value: 'h4' },
  ],
  lists: [
    { title: '• 목록', value: 'bullet' },
    { title: '번호 목록', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Italic', value: 'em' },
    ],
    annotations: [
      {
        name: 'color',
        type: 'object' as const,
        title: '글자색',
        fields: [{ name: 'hex', type: 'string', title: 'HEX' }],
      },
    ],
  },
});

const imageMember = defineArrayMember({
  type: 'image',
  options: { hotspot: true },
});

export default defineType({
  name: 'localizedBlockContent',
  title: '다국어 리치 텍스트 (블로그)',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'array',
      of: [blockMember, imageMember],
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [blockMember, imageMember],
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'array',
      of: [blockMember, imageMember],
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'array',
      of: [blockMember, imageMember],
    }),
  ],
});
