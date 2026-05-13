import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import './hospital-tool.css';

interface CountResult {
  doctorCount: number;
  heroCount: number;
}

const COUNT_QUERY = `{
  "doctorCount": count(*[_type == "doctor"]),
  "heroCount": count(*[_type == "pageHero"])
}`;

export function HospitalTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [counts, setCounts] = useState<CountResult>({
    doctorCount: 0,
    heroCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<CountResult>(COUNT_QUERY).then((data) => {
      setCounts(data);
      setLoading(false);
    });
  }, [client]);

  if (loading) {
    return <div className="ht-loading">불러오는 중...</div>;
  }

  return (
    <div className="ht-container">
      {/* ─── 병원 정보 ─── */}
      <div className="ht-section">
        <h3 className="ht-section-title">병원 정보</h3>
        <div className="ht-card-grid">
          <div className="ht-card">
            <div className="ht-card-icon">🏥</div>
            <div className="ht-card-body">
              <p className="ht-card-title">병원 기본 정보</p>
              <p className="ht-card-desc">주소, 연락처, 운영시간</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{
                id: 'forever-myeongdong-clinic-info',
                type: 'clinicInfo',
              }}
            >
              편집
            </IntentLink>
          </div>
        </div>
      </div>

      {/* ─── 의료진 / 히어로 배너 ─── */}
      <div className="ht-section">
        <h3 className="ht-section-title">콘텐츠</h3>
        <div className="ht-card-grid">
          <div className="ht-card">
            <div className="ht-card-icon">👨‍⚕️</div>
            <div className="ht-card-body">
              <p className="ht-card-title">
                <span className="ht-card-count">{counts.doctorCount}</span>
                의료진
              </p>
              <p className="ht-card-desc">의료진 목록 관리</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ type: 'doctor' }}
            >
              목록
            </IntentLink>
          </div>

          <div className="ht-card">
            <div className="ht-card-icon">🖼️</div>
            <div className="ht-card-body">
              <p className="ht-card-title">
                <span className="ht-card-count">{counts.heroCount}</span>
                히어로 배너
              </p>
              <p className="ht-card-desc">페이지별 히어로 이미지</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ type: 'pageHero' }}
            >
              목록
            </IntentLink>
          </div>
        </div>
      </div>

      {/* ─── 사이트 설정 ─── */}
      <div className="ht-section">
        <h3 className="ht-section-title">사이트 설정</h3>
        <div className="ht-card-grid">
          <div className="ht-card">
            <div className="ht-card-icon">💡</div>
            <div className="ht-card-body">
              <p className="ht-card-title">브랜드 철학</p>
              <p className="ht-card-desc">브랜드 메시지 설정</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{
                id: 'forever-myeongdong-brand',
                type: 'brandPhilosophy',
              }}
            >
              편집
            </IntentLink>
          </div>

          <div className="ht-card">
            <div className="ht-card-icon">📊</div>
            <div className="ht-card-body">
              <p className="ht-card-title">통계 수치</p>
              <p className="ht-card-desc">수치 스트립 설정</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ id: 'forever-myeongdong-stats', type: 'statsStrip' }}
            >
              편집
            </IntentLink>
          </div>

          <div className="ht-card">
            <div className="ht-card-icon">🗂️</div>
            <div className="ht-card-body">
              <p className="ht-card-title">빠른 탐색 탭</p>
              <p className="ht-card-desc">퀵엔트리 탭 목록</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ type: 'quickEntryTab' }}
            >
              목록
            </IntentLink>
          </div>

          <div className="ht-card">
            <div className="ht-card-icon">🃏</div>
            <div className="ht-card-body">
              <p className="ht-card-title">빠른 탐색 카드</p>
              <p className="ht-card-desc">퀵엔트리 카드 목록</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ type: 'quickEntryCard' }}
            >
              목록
            </IntentLink>
          </div>

          <div className="ht-card">
            <div className="ht-card-icon">🎉</div>
            <div className="ht-card-body">
              <p className="ht-card-title">이벤트 팝업</p>
              <p className="ht-card-desc">팝업 배너 설정</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ type: 'eventPopup' }}
            >
              목록
            </IntentLink>
          </div>
        </div>
      </div>

      {/* ─── 섹션 노출 설정 ─── */}
      <div className="ht-section">
        <h3 className="ht-section-title">섹션 노출 설정</h3>
        <div className="ht-card-grid">
          <div className="ht-card">
            <div className="ht-card-icon">👁️</div>
            <div className="ht-card-body">
              <p className="ht-card-title">섹션 노출 설정</p>
              <p className="ht-card-desc">페이지 섹션 노출 여부 제어</p>
            </div>
            <IntentLink
              className="ht-edit-btn"
              intent="edit"
              params={{ id: 'sectionVisibility', type: 'sectionVisibility' }}
            >
              편집
            </IntentLink>
          </div>
        </div>
      </div>
    </div>
  );
}
