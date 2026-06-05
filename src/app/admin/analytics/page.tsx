import {
  runReport,
  isGaDataConfigured,
  type ReportRequest,
  type ReportRow,
} from '@/lib/analytics/ga-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ---------- 보안: ?key= 가 env 와 일치해야 열람 ---------- */
function authorized(key: string | undefined): boolean {
  const secret = process.env.ANALYTICS_DASHBOARD_KEY;
  return Boolean(secret) && key === secret;
}

/* ---------- 표 렌더 (서버) ---------- */
async function Section({
  title,
  desc,
  headers,
  req,
  format,
}: {
  title: string;
  desc: string;
  headers: string[];
  req: ReportRequest;
  format?: (row: ReportRow) => (string | number)[];
}) {
  let rows: ReportRow[] = [];
  let error: string | null = null;
  try {
    rows = await runReport(req);
  } catch (e) {
    error = e instanceof Error ? e.message : '조회 실패';
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>
        {title}
      </h2>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>
        {desc}
      </p>
      {error ? (
        <p style={{ fontSize: 13, color: '#b91c1c' }}>⚠️ {error}</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          아직 데이터 없음 (수집 직후이거나 맞춤 측정기준 반영 전 — 최대 24h)
        </p>
      ) : (
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
        >
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={h} style={thStyle(i === headers.length - 1)}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const cells = format
                ? format(row)
                : [...row.dims, ...row.metrics];
              return (
                <tr key={idx} style={{ borderTop: '1px solid #eef0f3' }}>
                  {cells.map((c, i) => (
                    <td key={i} style={tdStyle(i === cells.length - 1)}>
                      {typeof c === 'number' ? c.toLocaleString() : c}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default async function AnalyticsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; days?: string }>;
}) {
  const { key, days } = await searchParams;

  if (!authorized(key)) {
    return (
      <main style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
        <h1 style={{ fontSize: 18 }}>접근 불가</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          URL 끝에 <code>?key=발급키</code> 를 붙여 접근하세요.
        </p>
      </main>
    );
  }

  if (!isGaDataConfigured) {
    return (
      <main style={{ maxWidth: 640, margin: '60px auto', padding: 24 }}>
        <h1 style={{ fontSize: 18 }}>GA4 Data API 미설정</h1>
        <ol style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
          <li>GCP 콘솔 → &quot;Google Analytics Data API&quot; 사용 설정</li>
          <li>서비스 계정 생성 → JSON 키 다운로드</li>
          <li>
            GA4 관리 → 속성 액세스 관리 → 서비스 계정 이메일을 <b>뷰어</b>로
            추가
          </li>
          <li>
            Vercel env: <code>GA_SERVICE_ACCOUNT_JSON</code>(JSON 한 줄),{' '}
            <code>ANALYTICS_DASHBOARD_KEY</code>(임의 비밀) 설정 후 재배포
          </li>
        </ol>
      </main>
    );
  }

  const range = `${Number(days) || 28}daysAgo`;
  const period = { startDate: range, endDate: 'today' };
  const CONV = ['form_submit', 'messenger_click', 'tel_click'];

  return (
    <main
      style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px 80px' }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          포에버 명동 · 애널리틱스 대시보드
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>
          최근 {Number(days) || 28}일 · GA4 속성 540235299 ·{' '}
          <a href={`?key=${key}&days=7`} style={linkStyle}>
            7일
          </a>{' '}
          ·{' '}
          <a href={`?key=${key}&days=28`} style={linkStyle}>
            28일
          </a>{' '}
          ·{' '}
          <a href={`?key=${key}&days=90`} style={linkStyle}>
            90일
          </a>
        </p>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        <Section
          title="① 이벤트 개요"
          desc="전체 이벤트별 발생 수 / 사용자 수"
          headers={['이벤트', '이벤트 수', '사용자']}
          req={{
            ...period,
            dimensions: ['eventName'],
            metrics: ['eventCount', 'totalUsers'],
            orderByMetric: 'eventCount',
            limit: 30,
          }}
        />

        <Section
          title="② 유입 출처"
          desc="사용자가 어디서 들어왔나 (세션 소스/매체)"
          headers={['소스/매체', '사용자', '세션']}
          req={{
            ...period,
            dimensions: ['sessionSourceMedium'],
            metrics: ['totalUsers', 'sessions'],
            orderByMetric: 'sessions',
            limit: 25,
          }}
        />

        <Section
          title="③ 버튼 클릭 랭킹"
          desc="어떤 버튼이 많이 눌렸나 (섹션 · 버튼 ID)"
          headers={['섹션', '버튼 ID', '클릭 수', '사용자']}
          req={{
            ...period,
            dimensions: ['customEvent:section', 'customEvent:button_id'],
            metrics: ['eventCount', 'totalUsers'],
            eventNames: ['button_click'],
            orderByMetric: 'eventCount',
            limit: 50,
          }}
        />

        <Section
          title="④ 전환 × 유입 채널"
          desc="어느 소스/매체가 폼제출·메신저·전화를 만드나"
          headers={['소스/매체', '전환 이벤트', '횟수']}
          req={{
            ...period,
            dimensions: ['sessionSourceMedium', 'eventName'],
            metrics: ['eventCount'],
            eventNames: CONV,
            orderByMetric: 'eventCount',
            limit: 50,
          }}
        />

        <Section
          title="⑤ 메신저 채널별 클릭"
          desc="카카오/위챗/LINE/WhatsApp 중 어디로 상담 진입"
          headers={['플랫폼', '클릭 수', '사용자']}
          req={{
            ...period,
            dimensions: ['customEvent:platform'],
            metrics: ['eventCount', 'totalUsers'],
            eventNames: ['messenger_click'],
            orderByMetric: 'eventCount',
            limit: 20,
          }}
        />

        <Section
          title="⑥ 섹션 도달률"
          desc="어떤 섹션까지 봤나 (section_view, 50% 노출 기준)"
          headers={['섹션', '도달 사용자', '노출 수']}
          req={{
            ...period,
            dimensions: ['customEvent:section'],
            metrics: ['totalUsers', 'eventCount'],
            eventNames: ['section_view'],
            orderByMetric: 'eventCount',
            limit: 40,
          }}
        />

        <Section
          title="⑦ 스크롤 깊이 분포"
          desc="페이지별 25/50/75/100% 도달 사용자"
          headers={['페이지', '스크롤 %', '사용자']}
          req={{
            ...period,
            dimensions: ['pagePath', 'customEvent:percent'],
            metrics: ['totalUsers'],
            eventNames: ['scroll_depth'],
            orderByMetric: 'totalUsers',
            limit: 100,
          }}
        />

        <Section
          title="⑧ 페이지 × 섹션 × 버튼"
          desc="어느 페이지 어느 섹션의 어떤 버튼 (교차)"
          headers={['페이지', '섹션', '버튼 ID', '클릭 수']}
          req={{
            ...period,
            dimensions: [
              'pagePath',
              'customEvent:section',
              'customEvent:button_id',
            ],
            metrics: ['eventCount'],
            eventNames: ['button_click'],
            orderByMetric: 'eventCount',
            limit: 100,
          }}
        />
      </div>
    </main>
  );
}

/* ---------- 인라인 스타일 ---------- */
const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 18,
};
const linkStyle: React.CSSProperties = {
  color: '#a83c44',
  textDecoration: 'none',
};
function thStyle(last: boolean): React.CSSProperties {
  return {
    textAlign: last ? 'right' : 'left',
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    padding: '6px 8px',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  };
}
function tdStyle(last: boolean): React.CSSProperties {
  return {
    textAlign: last ? 'right' : 'left',
    padding: '7px 8px',
    fontVariantNumeric: 'tabular-nums',
    color: last ? '#111827' : '#374151',
    fontWeight: last ? 600 : 400,
  };
}
