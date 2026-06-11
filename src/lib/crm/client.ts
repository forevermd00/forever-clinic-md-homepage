/**
 * 스마트닥터(전능) Reservation API 클라이언트.
 *
 * - 인증: static key 토큰 (`Authorization: Bearer {token}`)
 * - 재시도: 네트워크/타임아웃/5xx 만 재시도 (4xx 는 즉시 중단)
 * - 4xx/5xx 응답은 CrmApiError 로 던진다.
 */

const BASE =
  process.env.SMARTDOCTOR_API_BASE ??
  'https://reservation.api.receipt.smartdoctor.systems';
const TOKEN = process.env.SMARTDOCTOR_API_TOKEN ?? '';

const DEFAULT_TIMEOUT_MS = 7000;
const MAX_RETRIES = 1; // 최초 1회 + 재시도 1회 (사용자 대기시간 고려)

export class CrmApiError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'CrmApiError';
  }
}

export function isCrmConfigured(): boolean {
  return Boolean(TOKEN);
}

/** 전화번호를 숫자만 남긴다 (국가코드/하이픈/공백 제거). 한국 번호의 선행 0 은 유지. */
export function normalizeCellPhone(raw: string | undefined | null): string {
  if (!raw) return '';
  let s = String(raw).trim();
  // "+82 010-1234-5678" → 국가코드 +82 제거 후 로컬 번호 사용
  s = s.replace(/^\+82\s*/, '');
  const digits = s.replace(/\D/g, '');
  return digits;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

type RequestOpts = {
  method?: 'GET' | 'POST';
  query?: Record<string, string | string[] | number | undefined>;
  body?: unknown;
  timeoutMs?: number;
};

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  if (!TOKEN) {
    throw new CrmApiError('SMARTDOCTOR_API_TOKEN 미설정', 0);
  }

  const url = new URL(path, BASE);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined) continue;
      if (Array.isArray(v))
        v.forEach((item) => url.searchParams.append(k, item));
      else url.searchParams.set(k, String(v));
    }
  }

  const method = opts.method ?? 'GET';
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const text = await res.text();
      let parsed: unknown = undefined;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      if (res.ok) return parsed as T;

      // 4xx → 재시도 무의미, 즉시 중단. 5xx → 재시도.
      const err = new CrmApiError(
        `CRM API ${res.status} ${path}`,
        res.status,
        parsed,
      );
      if (res.status < 500) throw err;
      lastErr = err;
    } catch (e) {
      clearTimeout(timer);
      // 4xx 는 위에서 throw → 여기로 안 옴. 네트워크/timeout/5xx 만 도달.
      if (
        e instanceof CrmApiError &&
        e.httpStatus !== 0 &&
        e.httpStatus < 500
      ) {
        throw e;
      }
      lastErr = e;
    }

    if (attempt < MAX_RETRIES) {
      await sleep(500 * (attempt + 1)); // 0.5s, 1s
    }
  }

  if (lastErr instanceof CrmApiError) throw lastErr;
  throw new CrmApiError(
    `CRM API 호출 실패: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`,
    0,
    lastErr,
  );
}

/* ================================================================
   타입
================================================================ */

export interface ReservationTargetUser {
  id: string;
  name: string;
}
export interface ReservationTargetDepartment {
  code: string; // departmentCode
  name: string;
  subjectCode: string;
  subjectName: string;
  userDTOs: ReservationTargetUser[];
}

export interface CrmCustomer {
  customerNumber: string;
  name: string;
  cellPhone: string;
  email?: string;
}

export interface ReservationCount {
  reservationDate: string; // yyyy-MM-dd
  reservationTime: string; // HH:mm
  count: number;
}

export interface DepartmentTimeSlot {
  departmentCode: string;
  timeSlotLimit: number; // 슬롯당 최대 예약 수 (0/없음 = 무제한)
  timeSlotUnit: number; // 슬롯 단위(분)
}

export interface CreateCustomerInput {
  name: string;
  cellPhone: string; // 정규화된 숫자 문자열
  email?: string;
  memo?: string;
  personalInformationAgreementAccepted?: boolean;
}

export interface CreateReservationInput {
  subjectCode: string;
  departmentCode: string;
  chargeDoctorId: string;
  reservationDate: string; // yyyy-MM-dd
  reservationStartTime: string; // HH:mm:ss
  reservationEndTime: string; // HH:mm:ss
  reservationMemo?: string;
  etcMemo?: string;
  etcReservationFrom?: string;
}

/* ================================================================
   엔드포인트
================================================================ */

/** 예약 등록 가능한 진료과목/부서/담당의 조합 조회 */
export async function listReservationTargets(): Promise<
  ReservationTargetDepartment[]
> {
  const data = await request<{
    departmentDTOs?: ReservationTargetDepartment[];
  }>('/reservation-api/users/reservation');
  return data.departmentDTOs ?? [];
}

/** 부서별 30분 단위 현재 예약 수 조회 */
export async function getReservationCounts(args: {
  reservationDate: string;
  departmentCodes?: string[];
}): Promise<ReservationCount[]> {
  const data = await request<{ reservationCounts?: ReservationCount[] }>(
    '/reservation-api/v2/departments/reservationCounts',
    {
      query: {
        reservationDate: args.reservationDate,
        departmentCodes: args.departmentCodes,
      },
    },
  );
  return data.reservationCounts ?? [];
}

/** 부서별 슬롯당 최대 예약 수(한도) 조회 */
export async function getDepartmentTimeSlots(
  departmentCodes: string[],
): Promise<DepartmentTimeSlot[]> {
  const data = await request<{ timeSlots?: DepartmentTimeSlot[] }>(
    '/reservation-api/v2/departments/reservationTimeSlots',
    { query: { departmentCodes } },
  );
  return data.timeSlots ?? [];
}

/** 이름 + 전화번호로 기존 고객 조회 (없으면 빈 배열) */
export async function findCustomer(args: {
  name: string;
  cellPhone: string;
}): Promise<CrmCustomer | null> {
  const data = await request<{ customers?: CrmCustomer[] }>(
    '/reservation-api/v2/customers',
    { query: { name: args.name, cellPhone: args.cellPhone } },
  );
  const list = data.customers ?? [];
  return list.length > 0 ? list[0] : null;
}

/**
 * 신규 고객 등록.
 * - citizenNumber: 전능 안내에 따라 **필드 자체를 생략** (서버가 가주민번호 처리).
 * - 기본값이 있는 필드(email/address/memo/sms 등): 생략 시 DTO 기본값 적용 → null 전송 금지.
 * - GET 선조회로 중복을 거르므로 ignoreDuplicateCustomer=false 로 등록.
 */
export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CrmCustomer> {
  const body: Record<string, unknown> = {
    duplicateCheckType: 'CELLPHONE_AND_NAME',
    ignoreDuplicateCustomer: false,
    name: input.name,
    cellPhone: input.cellPhone,
    personalInformationAgreementAccepted:
      input.personalInformationAgreementAccepted ?? true,
  };
  if (input.email) body.email = input.email;
  if (input.memo) body.memo = input.memo;
  // citizenNumber, address1/2, isSmsDenied 등은 의도적으로 생략 (기본값 사용)

  const data = await request<{ customer?: CrmCustomer }>(
    '/reservation-api/v2/customers',
    { method: 'POST', body },
  );
  if (!data.customer?.customerNumber) {
    throw new CrmApiError('고객 등록 응답에 customerNumber 없음', 0, data);
  }
  return data.customer;
}

/** 특정 고객에 예약 등록. 반환: 예약 일련번호(seqNo) */
export async function createReservation(
  customerNumber: string,
  input: CreateReservationInput,
): Promise<number> {
  const body: Record<string, unknown> = {
    subjectCode: input.subjectCode,
    departmentCode: input.departmentCode,
    chargeDoctorId: input.chargeDoctorId,
    reservationDate: input.reservationDate,
    reservationStartTime: input.reservationStartTime,
    reservationEndTime: input.reservationEndTime,
    sendMessage: true,
  };
  if (input.reservationMemo) body.reservationMemo = input.reservationMemo;
  if (input.etcMemo) body.etcMemo = input.etcMemo;
  if (input.etcReservationFrom)
    body.etcReservationFrom = input.etcReservationFrom;
  // sendMessage(true): 예약 등록 시 CRM 문자 발송. labelId(0), prescriptionCodes 는 생략 (기본값/미사용)

  const data = await request<{
    reservation?: { id?: { seqNo?: number } };
  }>(
    `/reservation-api/v2/customers/${encodeURIComponent(customerNumber)}/reservations`,
    {
      method: 'POST',
      body,
    },
  );
  const seqNo = data.reservation?.id?.seqNo;
  if (typeof seqNo !== 'number') {
    throw new CrmApiError('예약 등록 응답에 seqNo 없음', 0, data);
  }
  return seqNo;
}
