import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import { PressDetail } from './PressDetail';
import { VideoDetail } from './VideoDetail';
import { BlogDetail } from './BlogDetail';
import { NoticeDetail } from './NoticeDetail';
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

function PressPanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<PressDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<PressDoc[]>(PRESS_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'pressArticle',
      title: { ko: '' },
    });
    onEdit(newDoc._id);
  };

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="mt-toolbar">
        <button className="mt-add-btn" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="mt-table-wrap">
        <table className="mt-table">
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>언론사</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="mt-empty">
                  보도자료가 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="mt-row-num">{idx + 1}</td>
                  <td>
                    <span className="mt-title">{doc.title}</span>
                  </td>
                  <td className="mt-meta">{doc.source || '—'}</td>
                  <td className="mt-meta">
                    {formatDate(doc.publishDate || doc._createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VideoPanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<VideoDoc[]>(VIDEO_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'youtubeVideo',
      title: { ko: '' },
    });
    onEdit(newDoc._id);
  };

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="mt-toolbar">
        <button className="mt-add-btn" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="mt-table-wrap">
        <table className="mt-table">
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '220px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>YouTube ID</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="mt-empty">
                  영상 콘텐츠가 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="mt-row-num">{idx + 1}</td>
                  <td>
                    <span className="mt-title">{doc.title}</span>
                  </td>
                  <td
                    className="mt-meta"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 200,
                    }}
                  >
                    {doc.youtubeId || '—'}
                  </td>
                  <td className="mt-meta">{formatDate(doc.publishDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlogPanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<BlogDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<BlogDoc[]>(BLOG_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'blogPost',
      title: { ko: '' },
    });
    onEdit(newDoc._id);
  };

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="mt-toolbar">
        <button className="mt-add-btn" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="mt-table-wrap">
        <table className="mt-table">
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="mt-empty">
                  블로그 포스트가 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="mt-row-num">{idx + 1}</td>
                  <td>
                    <span className="mt-title">{doc.title}</span>
                  </td>
                  <td className="mt-meta">{doc.category || '—'}</td>
                  <td className="mt-meta">{formatDate(doc.publishDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NoticePanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<NoticeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<NoticeDoc[]>(NOTICE_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  const handleAdd = async () => {
    const newDoc = await client.create({ _type: 'notice', title: { ko: '' } });
    onEdit(newDoc._id);
  };

  if (loading) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="mt-toolbar">
        <button className="mt-add-btn" onClick={handleAdd}>
          + 추가
        </button>
      </div>
      <div className="mt-table-wrap">
        <table className="mt-table">
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '80px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th style={{ textAlign: 'center' }}>고정</th>
              <th>날짜</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="mt-empty">
                  공지사항이 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

type TabKey = 'press' | 'video' | 'blog' | 'notice';

const TABS: { key: TabKey; label: string; docType: string }[] = [
  { key: 'press', label: '보도자료', docType: 'pressArticle' },
  { key: 'video', label: '영상 콘텐츠', docType: 'youtubeVideo' },
  { key: 'blog', label: '블로그', docType: 'blogPost' },
  { key: 'notice', label: '공지사항', docType: 'notice' },
];

export function MediaTool() {
  const router = useRouter();
  const routerState = useRouterState() as {
    docType?: string;
    selectedId?: string;
  } | null;
  const docType = routerState?.docType;
  const selectedId = routerState?.selectedId;

  const [activeTab, setActiveTab] = useState<TabKey>('press');

  const navigateTo = (dt: string, id: string) => {
    router.navigate({ docType: dt, selectedId: id });
  };

  const goBack = () => {
    router.navigate({});
  };

  // Detail view
  if (selectedId && docType) {
    if (docType === 'pressArticle') {
      return <PressDetail id={selectedId} onBack={goBack} />;
    }
    if (docType === 'youtubeVideo') {
      return <VideoDetail id={selectedId} onBack={goBack} />;
    }
    if (docType === 'blogPost') {
      return <BlogDetail id={selectedId} onBack={goBack} />;
    }
    if (docType === 'notice') {
      return <NoticeDetail id={selectedId} onBack={goBack} />;
    }
  }

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

      {activeTab === 'press' && (
        <PressPanel onEdit={(id) => navigateTo('pressArticle', id)} />
      )}
      {activeTab === 'video' && (
        <VideoPanel onEdit={(id) => navigateTo('youtubeVideo', id)} />
      )}
      {activeTab === 'blog' && (
        <BlogPanel onEdit={(id) => navigateTo('blogPost', id)} />
      )}
      {activeTab === 'notice' && (
        <NoticePanel onEdit={(id) => navigateTo('notice', id)} />
      )}
    </div>
  );
}
