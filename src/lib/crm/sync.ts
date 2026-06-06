import {
  CrmApiError,
  createCustomer,
  createReservation,
  findCustomer,
  isCrmConfigured,
  normalizeCellPhone,
} from './client';
import { getCrmSettings, isReservationReady } from './settings';

export type CrmSyncStatus = 'success' | 'failed' | 'skipped';

export interface ReservationSyncInput {
  name: string;
  /** 원본 전화 문자열 (예: "+82 010-1234-5678") — 내부에서 정규화 */
  phone: string;
  email?: string;
  /** yyyy-MM-dd */
  reservationDate?: string;
  /** HH:mm */
  reservationTime?: string;
  /** 고객 메모 (간단) */
  customerMemo?: string;
  /** 예약 메모 (간단 요약) */
  reservationMemo?: string;
  /** 시술 리스트 + 견적 + 요구사항 원문 */
  etcMemo?: string;
  /** UTM 등 유입 출처 */
  etcReservationFrom?: string;
}

export interface ReservationSyncResult {
  status: CrmSyncStatus;
  customerNumber?: string;
  reservationSeqNo?: number;
  failedStep?: 'config' | 'customer' | 'reservation';
  httpStatus?: number;
  error?: string;
}

/** "HH:mm" + 분 → "HH:mm:ss" (24h clamp) */
function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  let total = h * 60 + m + minutes;
  if (total >= 24 * 60) total = 24 * 60 - 1;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

/**
 * 홈페이지 예약을 CRM에 등록한다.
 * 절대 throw 하지 않는다 (실패해도 상담 접수 흐름을 막지 않도록 결과 객체로 반환).
 */
export async function syncReservationToCrm(
  input: ReservationSyncInput,
): Promise<ReservationSyncResult> {
  // 0) 토큰/설정 점검
  if (!isCrmConfigured()) {
    return {
      status: 'failed',
      failedStep: 'config',
      error: 'SMARTDOCTOR_API_TOKEN 미설정',
    };
  }

  const settings = await getCrmSettings();
  if (!isReservationReady(settings)) {
    return {
      status: 'failed',
      failedStep: 'config',
      error:
        '기본 진료과목/부서/담당의가 설정되지 않음 (Studio > 설정 > CRM 연동)',
    };
  }

  if (!input.reservationDate || !input.reservationTime) {
    return {
      status: 'failed',
      failedStep: 'config',
      error: '예약 일시 누락 — CRM은 예약 일시가 필수',
    };
  }

  const cellPhone = normalizeCellPhone(input.phone);

  // 1) 고객 조회 → 없으면 등록
  let customerNumber: string;
  try {
    const existing = await findCustomer({ name: input.name, cellPhone });
    if (existing) {
      customerNumber = existing.customerNumber;
    } else {
      const created = await createCustomer({
        name: input.name,
        cellPhone,
        email: input.email,
        memo: input.customerMemo ?? '홈페이지 예약',
        personalInformationAgreementAccepted: true,
      });
      customerNumber = created.customerNumber;
    }
  } catch (e) {
    // 409(중복) → 재조회로 폴백
    if (e instanceof CrmApiError && e.httpStatus === 409) {
      const again = await findCustomer({ name: input.name, cellPhone }).catch(
        () => null,
      );
      if (again) {
        customerNumber = again.customerNumber;
      } else {
        return errResult('customer', e);
      }
    } else {
      return errResult('customer', e);
    }
  }

  // 2) 예약 등록
  try {
    const startTime = `${input.reservationTime}:00`;
    const endTime = addMinutes(
      input.reservationTime,
      settings.reservationDurationMin,
    );
    const seqNo = await createReservation(customerNumber, {
      subjectCode: settings.subjectCode!,
      departmentCode: settings.departmentCode!,
      chargeDoctorId: settings.chargeDoctorId!,
      reservationDate: input.reservationDate,
      reservationStartTime: startTime,
      reservationEndTime: endTime,
      reservationMemo: input.reservationMemo,
      etcMemo: input.etcMemo,
      etcReservationFrom: input.etcReservationFrom,
    });
    return { status: 'success', customerNumber, reservationSeqNo: seqNo };
  } catch (e) {
    return errResult('reservation', e, customerNumber);
  }
}

function errResult(
  step: 'customer' | 'reservation',
  e: unknown,
  customerNumber?: string,
): ReservationSyncResult {
  if (e instanceof CrmApiError) {
    const bodyMsg =
      e.body && typeof e.body === 'object' && 'message' in e.body
        ? String((e.body as { message?: unknown }).message)
        : undefined;
    return {
      status: 'failed',
      failedStep: step,
      customerNumber,
      httpStatus: e.httpStatus,
      error: bodyMsg ? `${e.message} — ${bodyMsg}` : e.message,
    };
  }
  return {
    status: 'failed',
    failedStep: step,
    customerNumber,
    error: e instanceof Error ? e.message : String(e),
  };
}
