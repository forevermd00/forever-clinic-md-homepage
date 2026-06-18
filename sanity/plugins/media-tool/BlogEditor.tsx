import { useRef, useState, useCallback, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { SanityClient } from 'sanity';

// 미리보기에서 허용할 인라인 HTML (형광펜 등) — 공개 렌더와 동일 정책
const MD_SCHEMA = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'mark', 'u', 'sup', 'sub'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className'],
  },
};

// ─── 이미지 에셋 유틸 ──────────────────────────────────────

// 마크다운 본문에서 Sanity CDN 이미지 URL 추출
function extractImageUrls(md: string): string[] {
  const re = /!\[[^\]]*\]\((https:\/\/cdn\.sanity\.io\/images\/[^)\s]+)\)/g;
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) urls.push(m[1]);
  return urls;
}

// CDN URL → 에셋 _id  (…/<hash>-800x600.jpg → image-<hash>-800x600-jpg)
function urlToAssetId(url: string): string | null {
  const file = url.split('/').pop()?.split('?')[0];
  if (!file) return null;
  const dot = file.lastIndexOf('.');
  if (dot < 0) return null;
  return `image-${file.slice(0, dot)}-${file.slice(dot + 1)}`;
}

// ─── Preview Styles (Studio 전역 CSS 무력화 위해 인라인 지정) ───
const PREVIEW_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '18px 0 10px' }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: 20, fontWeight: 700, margin: '16px 0 8px' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: 17, fontWeight: 700, margin: '14px 0 6px' }}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 style={{ fontSize: 15, fontWeight: 600, margin: '12px 0 4px' }}>
      {children}
    </h4>
  ),
  p: ({ children }) => <p style={{ margin: '0 0 10px' }}>{children}</p>,
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  del: ({ children }) => (
    <del style={{ textDecoration: 'line-through' }}>{children}</del>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: '0 0 10px' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', paddingLeft: 22, margin: '0 0 10px' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ margin: '2px 0', display: 'list-item' }}>{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid #d4c5b0',
        paddingLeft: 12,
        margin: '0 0 10px',
        color: '#666',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
  mark: ({ children }) => (
    <mark style={{ background: '#fff3cd', padding: '0 2px' }}>{children}</mark>
  ),
  a: ({ href, children }) => (
    <a href={href} style={{ color: '#8b6f47', textDecoration: 'underline' }}>
      {children}
    </a>
  ),
  img: ({ src, alt }) =>
    typeof src === 'string' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        style={{ maxWidth: '100%', borderRadius: 6, margin: '10px 0' }}
      />
    ) : null,
  hr: () => (
    <hr
      style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '16px 0' }}
    />
  ),
  table: ({ children }) => (
    <table
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        margin: '0 0 10px',
        fontSize: 13,
      }}
    >
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid #e5e7eb',
        background: '#f5f5f5',
        padding: '4px 8px',
        textAlign: 'left',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid #e5e7eb', padding: '4px 8px' }}>
      {children}
    </td>
  ),
};

// ─── Toolbar Button ───────────────────────────────────────

function TBtn({
  onClick,
  children,
  title,
  style,
}: {
  onClick: () => void;
  children: ReactNode;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 500,
        border: '1px solid #d1d5db',
        borderRadius: 4,
        background: 'white',
        cursor: 'pointer',
        color: '#374151',
        lineHeight: '1.5',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <div
    style={{ width: 1, height: 16, background: '#e5e7eb', margin: '0 2px' }}
  />
);

// ─── Markdown Editor ──────────────────────────────────────

export function BlogEditor({
  client,
  value,
  onChange,
  docId,
  lang,
}: {
  client: SanityClient;
  value: string;
  onChange: (md: string) => void;
  docId: string;
  lang: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  // 이번 편집 세션에서 업로드한 이미지 URL (저장 전 즉시 삭제 케이스 대비)
  const sessionUploadsRef = useRef<Set<string>>(new Set());
  // 언어 전환/문서 전환은 BlogDetail의 key={id-lang} 로 리마운트되어 초기값으로 재설정됨

  // ─── Undo / Redo 히스토리 ───
  const historyRef = useRef<string[]>([value]);
  const idxRef = useRef(0);
  const lastRef = useRef<{ t: number; kind: 'type' | 'cmd' }>({
    t: 0,
    kind: 'cmd',
  });

  // 히스토리 기록 (연속 타이핑은 600ms 내 합침)
  const record = useCallback((next: string, kind: 'type' | 'cmd') => {
    const h = historyRef.current.slice(0, idxRef.current + 1);
    const now = Date.now();
    const coalesce =
      kind === 'type' &&
      lastRef.current.kind === 'type' &&
      now - lastRef.current.t < 600 &&
      h.length > 0;
    if (coalesce) h[h.length - 1] = next;
    else h.push(next);
    if (h.length > 200) h.shift();
    historyRef.current = h;
    idxRef.current = h.length - 1;
    lastRef.current = { t: now, kind };
  }, []);

  // 텍스트 변경 + 히스토리 기록
  const apply = useCallback(
    (next: string, kind: 'type' | 'cmd') => {
      setText(next);
      record(next, kind);
    },
    [record],
  );

  const setCaret = (pos: number, end?: number) => {
    const ta = taRef.current;
    if (!ta) return;
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = pos;
      ta.selectionEnd = end ?? pos;
    });
  };

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current -= 1;
    const v = historyRef.current[idxRef.current];
    setText(v);
    lastRef.current = { t: Date.now(), kind: 'cmd' };
    setCaret(v.length);
  }, []);

  const redo = useCallback(() => {
    if (idxRef.current >= historyRef.current.length - 1) return;
    idxRef.current += 1;
    const v = historyRef.current[idxRef.current];
    setText(v);
    lastRef.current = { t: Date.now(), kind: 'cmd' };
    setCaret(v.length);
  }, []);

  // ─── Sanity 에셋 정리 (제거된 이미지를 다른 곳에서 안 쓰면 삭제) ───
  const cleanupRemovedAssets = useCallback(
    async (oldMd: string, newMd: string) => {
      const after = new Set(extractImageUrls(newMd));
      // 이전 저장본 + 이번 세션 업로드분 중, 최종 본문에 없는 것
      const candidates = new Set([
        ...extractImageUrls(oldMd),
        ...sessionUploadsRef.current,
      ]);
      const removed = [...candidates].filter((u) => !after.has(u));
      if (!removed.length) return;
      try {
        const docs = await client.fetch<
          { _id: string; markdownContent?: Record<string, string> }[]
        >(`*[_type == "blogPost"]{ _id, markdownContent }`);
        // 최종 상태 기준 코퍼스 (현재 편집 중인 언어는 최신 newMd 로 대체)
        const corpus = docs
          .map((d) => {
            const mc = { ...(d.markdownContent || {}) };
            if (d._id === docId) mc[lang] = newMd;
            return JSON.stringify(mc);
          })
          .join('\n');
        for (const url of removed) {
          if (corpus.includes(url)) continue; // 어딘가에서 여전히 사용 중
          const assetId = urlToAssetId(url);
          if (assetId) await client.delete(assetId).catch(() => {});
        }
      } catch {
        // 정리 실패는 본문 저장에 영향 주지 않음
      }
    },
    [client, docId, lang],
  );

  const commit = useCallback(
    (next: string) => {
      if (next !== value) {
        onChange(next);
        void cleanupRemovedAssets(value, next);
      }
    },
    [value, onChange, cleanupRemovedAssets],
  );

  // 선택 영역을 prefix/suffix로 감싸기
  const wrap = useCallback(
    (prefix: string, suffix = prefix) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const sel = ta.value.slice(start, end) || '텍스트';
      const next =
        ta.value.slice(0, start) + prefix + sel + suffix + ta.value.slice(end);
      apply(next, 'cmd');
      setCaret(start + prefix.length, start + prefix.length + sel.length);
    },
    [apply],
  );

  // 현재 줄 맨 앞에 prefix 삽입 (제목·목록·인용)
  const linePrefix = useCallback(
    (prefix: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
      const next =
        ta.value.slice(0, lineStart) + prefix + ta.value.slice(lineStart);
      apply(next, 'cmd');
      setCaret(start + prefix.length);
    },
    [apply],
  );

  // 커서 위치에 텍스트 삽입
  const insertAtCursor = useCallback(
    (snippet: string) => {
      const ta = taRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = ta.value.slice(0, start) + snippet + ta.value.slice(end);
      apply(next, 'cmd');
      setCaret(start + snippet.length);
    },
    [apply],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        });
        sessionUploadsRef.current.add(asset.url);
        const alt = file.name.replace(/\.[^.]+$/, '');
        insertAtCursor(`\n\n![${alt}](${asset.url})\n\n`);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [client, insertAtCursor],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (k === 'y') {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo],
  );

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '6px 10px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fafafa',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TBtn title="소제목" onClick={() => linePrefix('## ')}>
          제목
        </TBtn>
        <TBtn title="소소제목" onClick={() => linePrefix('### ')}>
          소제목
        </TBtn>
        <Divider />
        <TBtn
          title="굵게"
          onClick={() => wrap('**')}
          style={{ fontWeight: 700 }}
        >
          B
        </TBtn>
        <TBtn
          title="기울임"
          onClick={() => wrap('*')}
          style={{ fontStyle: 'italic' }}
        >
          I
        </TBtn>
        <TBtn
          title="취소선"
          onClick={() => wrap('~~')}
          style={{ textDecoration: 'line-through' }}
        >
          S
        </TBtn>
        <TBtn title="형광펜" onClick={() => wrap('<mark>', '</mark>')}>
          <span style={{ background: '#fff3cd', padding: '0 3px' }}>형광</span>
        </TBtn>
        <Divider />
        <TBtn title="글머리 목록" onClick={() => linePrefix('- ')}>
          • 목록
        </TBtn>
        <TBtn title="번호 목록" onClick={() => linePrefix('1. ')}>
          1. 목록
        </TBtn>
        <TBtn title="인용" onClick={() => linePrefix('> ')}>
          ❝ 인용
        </TBtn>
        <TBtn
          title="링크"
          onClick={() => insertAtCursor('[링크 텍스트](https://)')}
        >
          🔗 링크
        </TBtn>
        <Divider />
        <TBtn title="이미지 삽입" onClick={() => fileInputRef.current?.click()}>
          {uploading ? '업로드 중…' : '🖼 이미지'}
        </TBtn>
        <div style={{ flex: 1 }} />
        <TBtn
          title="미리보기 토글"
          onClick={() => setShowPreview((v) => !v)}
          style={{
            background: showPreview ? '#eef2ff' : 'white',
            borderColor: showPreview ? '#6366f1' : '#d1d5db',
            color: showPreview ? '#4338ca' : '#374151',
          }}
        >
          👁 미리보기
        </TBtn>
      </div>

      {/* Editor + Preview */}
      <div style={{ display: 'flex', minHeight: 420 }}>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => apply(e.target.value, 'type')}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(text)}
          placeholder="마크다운으로 작성하거나 AI가 생성한 내용을 붙여넣으세요…"
          spellCheck={false}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            padding: '14px 16px',
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: '#1f2937',
            minHeight: 420,
            borderRight: showPreview ? '1px solid #e5e7eb' : 'none',
          }}
        />
        {showPreview && (
          <div
            style={{
              flex: 1,
              padding: '14px 18px',
              overflowY: 'auto',
              maxHeight: 600,
              fontSize: 14,
              lineHeight: 1.75,
              color: '#1f2937',
              background: '#fff',
            }}
            className="mt-md-preview"
          >
            {text.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw, [rehypeSanitize, MD_SCHEMA]]}
                components={PREVIEW_COMPONENTS}
              >
                {text}
              </ReactMarkdown>
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 13 }}>
                미리보기가 여기에 표시됩니다.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
