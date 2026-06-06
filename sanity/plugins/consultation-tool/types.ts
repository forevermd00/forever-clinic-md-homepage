export interface ConsultationDoc {
  _id: string;
  _createdAt: string;
  name: string;
  phone: string;
  email?: string;
  treatments?: { name?: string; packageLabel?: string; quantity?: number }[];
  message?: string;
  source?: string;
  status: string;
  consultNote?: string;
  createdAt?: string;
  preferredDate?: string;
  preferredTime?: string;
  isHidden?: boolean;
  // CRM(전능) 예약 적재 결과
  crmSyncStatus?: 'success' | 'failed' | 'skipped';
  crmCustomerNumber?: string;
  crmReservationSeqNo?: number;
  crmReservationFrom?: string;
  crmError?: string;
  crmSyncedAt?: string;
}

export const STATUS_OPTIONS = [
  { value: 'pending', label: '대기' },
  { value: 'in-progress', label: '상담중' },
  { value: 'completed', label: '상담완료' },
  { value: 'cancelled', label: '취소' },
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  'contact-form': '문의 폼',
  'consult-modal': '상담 모달',
};
