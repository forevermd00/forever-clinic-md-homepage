import { defineField, defineType } from 'sanity';

/**
 * 스마트닥터(전능) CRM 예약 연동 설정 — 싱글톤.
 * Studio "설정 > CRM 연동" 탭의 커스텀 UI에서 부서·담당의를 선택해 저장한다.
 * (문서 _id 는 'crmSettings' 고정)
 */
export const crmSettings = defineType({
  name: 'crmSettings',
  title: 'CRM 연동 설정',
  type: 'document',
  fields: [
    defineField({
      name: 'subjectCode',
      title: '진료과목 코드',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'subjectName',
      title: '진료과목',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'departmentCode',
      title: '부서 코드',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'departmentName',
      title: '부서',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'chargeDoctorId',
      title: '담당의 ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'chargeDoctorName',
      title: '담당의',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'reservationDurationMin',
      title: '예약 소요 시간(분)',
      type: 'number',
      initialValue: 30,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'CRM 연동 설정' }),
  },
});
