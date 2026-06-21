import { useState, useEffect, useCallback } from 'react';
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
  publisher?: string;
  publishedAt?: string;
  isVisible?: boolean;
  _createdAt: string;
}

interface VideoDoc {
  _id: string;
  title: string;
  youtubeId?: string;
  publishedAt?: string;
  isVisible?: boolean;
  displayLanguages?: string[];
}

interface BlogDoc {
  _id: string;
  title: string;
  slug?: string;
  category?: string;
  publishedAt?: string;
  isVisible?: boolean;
}

interface NoticeDoc {
  _id: string;
  title: string;
  isPinned?: boolean;
  publishedAt?: string;
  isVisible?: boolean;
}

// ─── Queries ────────────────────────────────────────────

const PRESS_QUERY = `
  *[_type == "pressArticle"] | order(_createdAt desc) {
    _id, _createdAt,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    "publisher": coalesce(publisher, source),
    "publishedAt": coalesce(publishedAt, publishDate),
    isVisible
  }
`;

const VIDEO_QUERY = `
  *[_type == "youtubeVideo"] | order(publishedAt desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    youtubeId, publishedAt, isVisible, displayLanguages
  }
`;

const BLOG_QUERY = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    "slug": slug.current,
    category, publishedAt, isVisible
  }
`;

const NOTICE_QUERY = `
  *[_type == "notice"] | order(isPinned desc, coalesce(publishDate, _createdAt) desc) {
    _id,
    "title": coalesce(title.ko, title.en, "(제목 없음)"),
    isPinned, "publishedAt": coalesce(publishDate, _createdAt), isVisible
  }
`;

// ─── Helpers ────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return dateStr.slice(0, 10);
}

// isVisible이 명시적으로 false인 경우만 숨김 처리 (null/undefined = 노출)
function isDocVisible(doc: { isVisible?: boolean }): boolean {
  return doc.isVisible !== false;
}

// ─── Visibility Toggle ───────────────────────────────────

function VisibilityToggle({
  id,
  visible,
  onToggle,
}: {
  id: string;
  visible: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <label
      className={`mt-toggle ${visible ? 'on' : 'off'}`}
      title={visible ? '클릭하여 숨기기' : '클릭하여 노출'}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={visible}
        onChange={() => onToggle(id, !visible)}
        style={{ display: 'none' }}
      />
      <span className="mt-toggle-track">
        <span className="mt-toggle-thumb" />
      </span>
    </label>
  );
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

  const handleToggle = useCallback(
    async (id: string, next: boolean) => {
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isVisible: next } : d)),
      );
      await client.patch(id).set({ isVisible: next }).commit();
    },
    [client],
  );

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'pressArticle',
      title: { ko: '' },
      isVisible: false,
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
            <col style={{ width: '60px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>언론사</th>
              <th>날짜</th>
              <th style={{ textAlign: 'center' }}>노출</th>
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
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="mt-row-num">{idx + 1}</td>
                  <td>
                    <span className="mt-title">{doc.title}</span>
                  </td>
                  <td className="mt-meta">{doc.publisher || '—'}</td>
                  <td className="mt-meta">
                    {formatDate(doc.publishedAt || doc._createdAt)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <VisibilityToggle
                      id={doc._id}
                      visible={isDocVisible(doc)}
                      onToggle={handleToggle}
                    />
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

  const handleToggle = useCallback(
    async (id: string, next: boolean) => {
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isVisible: next } : d)),
      );
      await client.patch(id).set({ isVisible: next }).commit();
    },
    [client],
  );

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'youtubeVideo',
      title: { ko: '' },
      isVisible: false,
      displayLanguages: ['ko', 'en', 'zh', 'ja'],
      publishedAt: new Date().toISOString().slice(0, 10),
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
            <col style={{ width: '200px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>표시 언어</th>
              <th>날짜</th>
              <th style={{ textAlign: 'center' }}>노출</th>
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
                <tr
                  key={doc._id}
                  className="mt-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="mt-row-num">{idx + 1}</td>
                  <td>
                    <span className="mt-title">{doc.title}</span>
                  </td>
                  <td className="mt-meta">
                    {doc.displayLanguages && doc.displayLanguages.length > 0 ? (
                      <span
                        style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}
                      >
                        {doc.displayLanguages.map((lang) => (
                          <span
                            key={lang}
                            style={{
                              fontSize: 10,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: '#e5e7eb',
                              color: '#374151',
                              fontWeight: 600,
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#dc2626' }}>
                        표시 안 됨
                      </span>
                    )}
                  </td>
                  <td className="mt-meta">{formatDate(doc.publishedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <VisibilityToggle
                      id={doc._id}
                      visible={isDocVisible(doc)}
                      onToggle={handleToggle}
                    />
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

  const handleToggle = useCallback(
    async (id: string, next: boolean) => {
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isVisible: next } : d)),
      );
      await client.patch(id).set({ isVisible: next }).commit();
    },
    [client],
  );

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'blogPost',
      title: { ko: '' },
      isVisible: false,
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
            <col style={{ width: '60px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>날짜</th>
              <th style={{ textAlign: 'center' }}>노출</th>
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
                  <td className="mt-meta">{formatDate(doc.publishedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <VisibilityToggle
                      id={doc._id}
                      visible={isDocVisible(doc)}
                      onToggle={handleToggle}
                    />
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

  const handleToggle = useCallback(
    async (id: string, next: boolean) => {
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isVisible: next } : d)),
      );
      await client.patch(id).set({ isVisible: next }).commit();
    },
    [client],
  );

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'notice',
      title: { ko: '' },
      isVisible: false,
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
            <col style={{ width: '60px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>제목</th>
              <th style={{ textAlign: 'center' }}>고정</th>
              <th>날짜</th>
              <th style={{ textAlign: 'center' }}>노출</th>
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
                  <td className="mt-meta">{formatDate(doc.publishedAt)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <VisibilityToggle
                      id={doc._id}
                      visible={isDocVisible(doc)}
                      onToggle={handleToggle}
                    />
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
