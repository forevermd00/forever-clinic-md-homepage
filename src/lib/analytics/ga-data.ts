import 'server-only';
import { JWT } from 'google-auth-library';

/**
 * GA4 Data API (서버 전용) — 서비스 계정으로 runReport 호출.
 *
 * 필요한 env:
 *  - GA_PROPERTY_ID          GA4 속성 ID (기본값 540235299)
 *  - GA_SERVICE_ACCOUNT_JSON 서비스 계정 키 JSON 전체 (한 줄 문자열)
 *
 * 서비스 계정 이메일을 GA4 속성에 "뷰어"로 추가해야 함.
 */

const PROPERTY_ID = process.env.GA_PROPERTY_ID ?? '540235299';

export const isGaDataConfigured = Boolean(process.env.GA_SERVICE_ACCOUNT_JSON);

function getClient(): JWT {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GA_SERVICE_ACCOUNT_JSON 미설정');
  const creds = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };
  return new JWT({
    email: creds.client_email,
    // env에 \n 이 literal로 들어간 경우 복원
    key: creds.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
}

export interface ReportRequest {
  dimensions: string[];
  metrics: string[];
  eventNames?: string[]; // eventName in (...) 필터
  orderByMetric?: string; // 내림차순 정렬할 metric
  limit?: number;
  startDate?: string; // 기본 28daysAgo
  endDate?: string; // 기본 today
}

export interface ReportRow {
  dims: string[];
  metrics: number[];
}

interface GaApiRow {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

/** runReport 실행 → 정규화된 행 배열 반환 */
export async function runReport(req: ReportRequest): Promise<ReportRow[]> {
  const client = getClient();
  const body: Record<string, unknown> = {
    dateRanges: [
      {
        startDate: req.startDate ?? '28daysAgo',
        endDate: req.endDate ?? 'today',
      },
    ],
    dimensions: req.dimensions.map((name) => ({ name })),
    metrics: req.metrics.map((name) => ({ name })),
    limit: req.limit ?? 50,
  };
  if (req.eventNames?.length) {
    body.dimensionFilter = {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: req.eventNames },
      },
    };
  }
  if (req.orderByMetric) {
    body.orderBys = [{ metric: { metricName: req.orderByMetric }, desc: true }];
  }

  const res = await client.request<{ rows?: GaApiRow[] }>({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    method: 'POST',
    data: body,
  });

  return (res.data.rows ?? []).map((r) => ({
    dims: (r.dimensionValues ?? []).map((d) => d.value ?? ''),
    metrics: (r.metricValues ?? []).map((m) => Number(m.value ?? 0)),
  }));
}
