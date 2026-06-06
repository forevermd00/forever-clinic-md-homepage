import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'contactInquiry',
  title: '상담 문의',
  type: 'document',
  preview: {
    select: {
      title: 'name',
      subtitle: 'createdAt',
      source: 'source',
      preferredDate: 'preferredDate',
      preferredTime: 'preferredTime',
    },
    prepare({ title, subtitle, source, preferredDate, preferredTime }) {
      const sourceLabels: Record<string, string> = {
        'contact-form': '문의 폼',
        'consult-modal': '상담 모달',
      };
      const dateStr = preferredDate
        ? ` · 예약희망 ${preferredDate}${preferredTime ? ' ' + preferredTime : ''}`
        : '';
      return {
        title: title || '(이름 없음)',
        subtitle: `${sourceLabels[source] || source || ''} ${subtitle ? `| ${subtitle}` : ''}${dateStr}`,
      };
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: '이름',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: '이메일',
      type: 'string',
    }),
    defineField({
      name: 'birthDate',
      title: '생년월일',
      type: 'string',
      description: 'YYYY-MM-DD',
    }),
    defineField({
      name: 'phone',
      title: '전화번호',
      type: 'string',
    }),
    defineField({
      name: 'messengerType',
      title: '메신저 유형',
      type: 'string',
      options: {
        list: [
          { title: 'KakaoTalk', value: 'KakaoTalk' },
          { title: 'LINE', value: 'LINE' },
          { title: 'WeChat', value: 'WeChat' },
          { title: 'WhatsApp', value: 'WhatsApp' },
        ],
      },
    }),
    defineField({
      name: 'messengerId',
      title: '메신저 아이디',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: '문의 내용',
      type: 'text',
    }),
    defineField({
      name: 'selectedTreatments',
      title: '관심 시술',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {
            select: { name: 'name', pkg: 'packageLabel', qty: 'quantity' },
            prepare({ name, pkg, qty }) {
              return {
                title: name || '',
                subtitle: `${pkg || ''} × ${qty || 1}`,
              };
            },
          },
          fields: [
            defineField({
              name: 'treatment',
              title: '시술',
              type: 'reference',
              to: [{ type: 'treatment' }],
            }),
            defineField({
              name: 'name',
              title: '시술명',
              type: 'string',
              readOnly: true,
            }),
            defineField({
              name: 'packageLabel',
              title: '패키지',
              type: 'string',
              readOnly: true,
            }),
            defineField({
              name: 'quantity',
              title: '수량',
              type: 'number',
              readOnly: true,
            }),
          ],
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
      name: 'preferredDate',
      title: '희망 예약일',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'preferredTime',
      title: '희망 예약시간',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: '문의일시',
      type: 'datetime',
      readOnly: true,
    }),

    // ── CRM(전능) 예약 적재 결과 (시스템 자동 기록) ──
    defineField({
      name: 'crmSyncStatus',
      title: 'CRM 적재 상태',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: '성공', value: 'success' },
          { title: '실패', value: 'failed' },
          { title: '미시도', value: 'skipped' },
        ],
      },
    }),
    defineField({
      name: 'crmCustomerNumber',
      title: 'CRM 고객번호',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'crmReservationSeqNo',
      title: 'CRM 예약번호',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'crmReservationFrom',
      title: '유입 출처(UTM)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'crmError',
      title: 'CRM 적재 오류',
      type: 'text',
      rows: 2,
      readOnly: true,
    }),
    defineField({
      name: 'crmSyncedAt',
      title: 'CRM 적재 시각',
      type: 'datetime',
      readOnly: true,
    }),
  ],
});
