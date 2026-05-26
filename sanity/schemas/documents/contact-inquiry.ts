import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'contactInquiry',
  title: '상담 문의',
  type: 'document',
  preview: {
    select: { title: 'name', subtitle: 'createdAt', source: 'source' },
    prepare({ title, subtitle, source }) {
      const sourceLabels: Record<string, string> = {
        'contact-form': '문의 폼',
        'consult-modal': '상담 모달',
      };
      return {
        title: title || '(이름 없음)',
        subtitle: `${sourceLabels[source] || source || ''} ${subtitle ? `| ${subtitle}` : ''}`,
      };
    },
  },
  fields: [
    defineField({ name: 'name', title: '이름', type: 'string' }),
    defineField({ name: 'email', title: '이메일', type: 'string' }),
    defineField({ name: 'phone', title: '전화번호', type: 'string' }),
    defineField({ name: 'message', title: '문의 내용', type: 'text' }),
    defineField({
      name: 'selectedTreatments',
      title: '관심 시술',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'treatment' }],
        }),
      ],
    }),
    defineField({
      name: 'source',
      title: '유입 경로',
      type: 'string',
      options: {
        list: [
          { title: '문의 폼', value: 'contact-form' },
          { title: '상담 모달', value: 'consult-modal' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: '상담 상태',
      type: 'string',
      options: {
        list: [
          { title: '대기', value: 'pending' },
          { title: '상담중', value: 'in-progress' },
          { title: '상담완료', value: 'completed' },
          { title: '취소', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'consultNote',
      title: '상담 메모',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'specialNote',
      title: '특이사항',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: '문의일시',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'isHidden',
      title: '숨김',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
