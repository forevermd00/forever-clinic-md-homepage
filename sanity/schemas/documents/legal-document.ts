import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'legalDocument',
  title: '법적 문서',
  type: 'document',
  fields: [
    defineField({
      name: 'documentType',
      title: '문서 유형',
      type: 'string',
      options: {
        list: [
          { title: '개인정보 처리방침', value: 'privacy-policy' },
          { title: '이용약관', value: 'terms-of-service' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: '제목',
      type: 'object',
      fields: [
        defineField({ name: 'ko', title: '한국어', type: 'string' }),
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'zh', title: '中文', type: 'string' }),
        defineField({ name: 'ja', title: '日本語', type: 'string' }),
      ],
    }),
    defineField({
      name: 'effectiveDate',
      title: '시행일',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
    }),
    defineField({
      name: 'publicationDate',
      title: '공고일',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
    }),
    defineField({
      name: 'contentKo',
      title: '내용 (한국어)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: '본문', value: 'normal' },
            { title: '소제목', value: 'h3' },
          ],
          lists: [
            { title: '• 목록', value: 'bullet' },
            { title: '번호 목록', value: 'number' },
          ],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      name: 'contentEn',
      title: '내용 (영어)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Sub-heading', value: 'h3' },
          ],
          lists: [
            { title: '• Bullet', value: 'bullet' },
            { title: '1. Number', value: 'number' },
          ],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      name: 'contentZh',
      title: '내용 (중국어)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Sub-heading', value: 'h3' },
          ],
          lists: [
            { title: '• Bullet', value: 'bullet' },
            { title: '1. Number', value: 'number' },
          ],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }],
            annotations: [],
          },
        },
      ],
    }),
    defineField({
      name: 'contentJa',
      title: '내용 (일본어)',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Sub-heading', value: 'h3' },
          ],
          lists: [
            { title: '• Bullet', value: 'bullet' },
            { title: '1. Number', value: 'number' },
          ],
          marks: {
            decorators: [{ title: 'Bold', value: 'strong' }],
            annotations: [],
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'documentType', subtitle: 'effectiveDate' },
    prepare({ title, subtitle }) {
      const labels: Record<string, string> = {
        'privacy-policy': '개인정보 처리방침',
        'terms-of-service': '이용약관',
      };
      return {
        title: labels[title] ?? title,
        subtitle: subtitle ? `시행일: ${subtitle}` : '',
      };
    },
  },
});
