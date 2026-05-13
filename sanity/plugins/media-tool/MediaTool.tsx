import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import './media-tool.css';

// ─── Types ───────────────────────────────────────────────

interface PressDoc {
  _id: string;
  title: string;
  source?: string;
  publishDate?: string;
  _createdAt: string;
}

interface VideoDoc {
  _id: string;
  title: string;
  youtubeId?: string;
  publishDate?: string;
}

interface BlogDoc {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  publishDate?: string;
}

interface NoticeDoc {
  _id: string;
  title: string;
  isPinned?: boolean;
  publishDate?: string;
}

// ─── Queries ────────────────────────────────────────────

const PRESS_QUERY = `
  *[_type == "pressArticle"] | order(_createdAt desc) {
    _id, _createdAt,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    source, publishDate
  }
`;

const VIDEO_QUERY = `
  *[_type == "youtubeVideo"] | order(publishDate desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    youtubeId, publishDate
  }
`;

const BLOG_QUERY = `
  *[_type == "blogPost"] | order(publishDate desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    "slug": slug.current,
    category, publishDate
  }
`;

const NOTICE_QUERY = `
  *[_type == "notice"] | order(isPinned desc, publishDate desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    isPinned, publishDate
  }
`;

// ─── Helpers ────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return dateStr.slice(0, 10);
}

// ─── Sub-tab panels ──────────────────────────────────────

function PressPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<PressDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<PressDoc[]>(PRESS_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div className="mt-table-wrap">
      <table className="mt-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
          <col style={{ width: '120px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '70px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
            <th>출처</th>
            <th>날짜</th>
            <th style={{ cursor: 'default' }}></th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={5} className="mt-empty">
                보도자료가 없습니다
              </td>
            </tr>
          ) : (
            docs.map((doc, idx) => (
              <tr key={doc._id}>
                <td className="mt-row-num">{idx + 1}</td>
                <td>
                  <span className="mt-title">{doc.title}</span>
                </td>
                <td className="mt-meta">{doc.source || '—'}</td>
                <td className="mt-meta">
                  {formatDate(doc.publishDate || doc._createdAt)}
                </td>
                <td>
                  <IntentLink
                    className="mt-edit-btn"
                    intent="edit"
                    params={{ id: doc._id, type: 'pressArticle' }}
                  >
                    편집
                  </IntentLink>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VideoPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<VideoDoc[]>(VIDEO_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div className="mt-table-wrap">
      <table className="mt-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
          <col style={{ width: '140px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '70px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
            <th>YouTube ID</th>
            <th>날짜</th>
            <th style={{ cursor: 'default' }}></th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={5} className="mt-empty">
                영상 콘텐츠가 없습니다
              </td>
            </tr>
          ) : (
            docs.map((doc, idx) => (
              <tr key={doc._id}>
                <td className="mt-row-num">{idx + 1}</td>
                <td>
                  <span className="mt-title">{doc.title}</span>
                </td>
                <td className="mt-meta">{doc.youtubeId || '—'}</td>
                <td className="mt-meta">{formatDate(doc.publishDate)}</td>
                <td>
                  <IntentLink
                    className="mt-edit-btn"
                    intent="edit"
                    params={{ id: doc._id, type: 'youtubeVideo' }}
                  >
                    편집
                  </IntentLink>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BlogPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<BlogDoc[]>(BLOG_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div className="mt-table-wrap">
      <table className="mt-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
          <col style={{ width: '120px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '70px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
            <th>카테고리</th>
            <th>날짜</th>
            <th style={{ cursor: 'default' }}></th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={5} className="mt-empty">
                블로그 포스트가 없습니다
              </td>
            </tr>
          ) : (
            docs.map((doc, idx) => (
              <tr key={doc._id}>
                <td className="mt-row-num">{idx + 1}</td>
                <td>
                  <span className="mt-title">{doc.title}</span>
                </td>
                <td className="mt-meta">{doc.category || '—'}</td>
                <td className="mt-meta">{formatDate(doc.publishDate)}</td>
                <td>
                  <IntentLink
                    className="mt-edit-btn"
                    intent="edit"
                    params={{ id: doc._id, type: 'blogPost' }}
                  >
                    편집
                  </IntentLink>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function NoticePanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<NoticeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<NoticeDoc[]>(NOTICE_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div className="mt-table-wrap">
      <table className="mt-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
          <col style={{ width: '80px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '70px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>제목</th>
            <th style={{ textAlign: 'center' }}>고정</th>
            <th>날짜</th>
            <th style={{ cursor: 'default' }}></th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan={5} className="mt-empty">
                공지사항이 없습니다
              </td>
            </tr>
          ) : (
            docs.map((doc, idx) => (
              <tr key={doc._id}>
                <td className="mt-row-num">{idx + 1}</td>
                <td>
                  <span className="mt-title">{doc.title}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {doc.isPinned ? (
                    <span className="mt-badge-pinned">고정</span>
                  ) : (
                    <span className="mt-meta">—</span>
                  )}
                </td>
                <td className="mt-meta">{formatDate(doc.publishDate)}</td>
                <td>
                  <IntentLink
                    className="mt-edit-btn"
                    intent="edit"
                    params={{ id: doc._id, type: 'notice' }}
                  >
                    편집
                  </IntentLink>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

type TabKey = 'press' | 'video' | 'blog' | 'notice';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'press', label: '보도자료' },
  { key: 'video', label: '영상 콘텐츠' },
  { key: 'blog', label: '블로그' },
  { key: 'notice', label: '공지사항' },
];

export function MediaTool() {
  const [activeTab, setActiveTab] = useState<TabKey>('press');

  return (
    <div className="mt-container">
      <div className="mt-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mt-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'press' && <PressPanel />}
      {activeTab === 'video' && <VideoPanel />}
      {activeTab === 'blog' && <BlogPanel />}
      {activeTab === 'notice' && <NoticePanel />}
    </div>
  );
}
