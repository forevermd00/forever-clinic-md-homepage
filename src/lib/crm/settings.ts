import { createClient } from '@sanity/client';

/**
 * CRM 연동 설정 — Sanity 싱글톤(`crmSettings`)에서 읽는다.
 * 설정 편집은 Studio "설정 > CRM 연동" 탭에서 이뤄진다.
 */
export interface CrmSettings {
  subjectCode: string | null;
  subjectName: string | null;
  departmentCode: string | null;
  departmentName: string | null;
  chargeDoctorId: string | null;
  chargeDoctorName: string | null;
  reservationDurationMin: number;
}

const DEFAULTS: CrmSettings = {
  subjectCode: null,
  subjectName: null,
  departmentCode: null,
  departmentName: null,
  chargeDoctorId: null,
  chargeDoctorName: null,
  reservationDurationMin: 30,
};

function sanity() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-04-25',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  });
}

export async function getCrmSettings(): Promise<CrmSettings> {
  try {
    const doc = await sanity().fetch<Partial<CrmSettings> | null>(
      `*[_type == "crmSettings"][0]{
        subjectCode, subjectName, departmentCode, departmentName,
        chargeDoctorId, chargeDoctorName, reservationDurationMin
      }`,
    );
    if (!doc) return DEFAULTS;
    return {
      subjectCode: doc.subjectCode ?? null,
      subjectName: doc.subjectName ?? null,
      departmentCode: doc.departmentCode ?? null,
      departmentName: doc.departmentName ?? null,
      chargeDoctorId: doc.chargeDoctorId ?? null,
      chargeDoctorName: doc.chargeDoctorName ?? null,
      reservationDurationMin:
        typeof doc.reservationDurationMin === 'number'
          ? doc.reservationDurationMin
          : 30,
    };
  } catch (e) {
    console.error('[crm] 설정 조회 실패:', e);
    return DEFAULTS;
  }
}

/** 기본 배정값이 모두 갖춰졌는지 (예약 등록 가능 조건) */
export function isReservationReady(s: CrmSettings): boolean {
  return Boolean(s.subjectCode && s.departmentCode && s.chargeDoctorId);
}
