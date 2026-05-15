import { useRef, useCallback, type ReactNode } from 'react';
import {
  PortableTextEditor,
  PortableTextEditable,
  usePortableTextEditor,
  usePortableTextEditorSelection,
} from '@sanity/portable-text-editor';
import type { PortableTextBlock } from '@sanity/types';
import type { EditorChange } from '@sanity/portable-text-editor';

// ─── Schema ───────────────────────────────────────────────

const LEGAL_SCHEMA = {
  name: 'legalContent',
  type: 'array' as const,
  of: [
    {
      name: 'block',
      type: 'block' as const,
      styles: [
        { title: '본문', value: 'normal' },
        { title: '소제목', value: 'h3' },
      ],
      lists: [
        { title: '• 목록', value: 'bullet' },
        { title: '번호 목록', value: 'number' },
      ],
      marks: {
        decorators: [{ title: 'Bold', value: 'strong' }],
        annotations: [],
      },
    },
  ],
};

// ─── Toolbar Button ───────────────────────────────────────

function TBtn({
  active,
  onMouseDown,
  children,
  title,
}: {
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      style={{
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        border: `1px solid ${active ? '#6b7280' : '#d1d5db'}`,
        borderRadius: 4,
        background: active ? '#f3f4f6' : 'white',
        cursor: 'pointer',
        color: active ? '#111827' : '#374151',
        lineHeight: '1.5',
        userSelect: 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Toolbar (inside PTE context) ─────────────────────────

function Toolbar() {
  const editor = usePortableTextEditor();
  usePortableTextEditorSelection(); // re-render on selection change

  const isBold = !!PortableTextEditor.isMarkActive(editor, 'strong');
  const isH3 = !!PortableTextEditor.hasBlockStyle(editor, 'h3');
  const isBullet = !!PortableTextEditor.hasListStyle(editor, 'bullet');
  const isNumber = !!PortableTextEditor.hasListStyle(editor, 'number');

  const md = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
    PortableTextEditor.focus(editor);
  };

  return (
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
      <TBtn
        active={isH3}
        title="소제목"
        onMouseDown={md(() =>
          PortableTextEditor.toggleBlockStyle(editor, 'h3'),
        )}
      >
        소제목
      </TBtn>
      <TBtn
        active={isBold}
        title="굵게 (Ctrl+B)"
        onMouseDown={md(() => PortableTextEditor.toggleMark(editor, 'strong'))}
      >
        <strong>B</strong>
      </TBtn>
      <div
        style={{ width: 1, height: 16, background: '#e5e7eb', margin: '0 2px' }}
      />
      <TBtn
        active={isBullet}
        title="점 목록"
        onMouseDown={md(() => PortableTextEditor.toggleList(editor, 'bullet'))}
      >
        • 목록
      </TBtn>
      <TBtn
        active={isNumber}
        title="번호 목록"
        onMouseDown={md(() => PortableTextEditor.toggleList(editor, 'number'))}
      >
        1. 목록
      </TBtn>
    </div>
  );
}

// ─── Editable Area (inside PTE context) ──────────────────

function EditableArea({
  editableRef,
  onBlur,
  placeholder,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  onBlur: () => void;
  placeholder?: string;
}) {
  return (
    <PortableTextEditable
      ref={editableRef}
      onBlur={onBlur}
      style={{
        outline: 'none',
        padding: '12px 14px',
        minHeight: 400,
        fontSize: 13,
        lineHeight: 1.7,
        color: '#374151',
      }}
      renderPlaceholder={() => (
        <span
          style={{
            color: '#9ca3af',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {placeholder ?? '내용을 입력하세요…'}
        </span>
      )}
      renderBlock={(props) => {
        const { value, children } = props;
        if (value.style === 'h3') {
          return (
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                marginTop: 16,
                marginBottom: 4,
                color: '#1f2937',
              }}
            >
              {children}
            </div>
          );
        }
        return (
          <div style={{ marginBottom: 4, color: '#374151' }}>{children}</div>
        );
      }}
      renderListItem={(props) => (
        <div style={{ paddingLeft: 16, marginBottom: 2, color: '#374151' }}>
          {props.children}
        </div>
      )}
      renderDecorator={(props) => {
        if (props.value === 'strong') {
          return <strong style={{ fontWeight: 700 }}>{props.children}</strong>;
        }
        return <>{props.children}</>;
      }}
    />
  );
}

// ─── Main Export ──────────────────────────────────────────

export function LegalEditor({
  value,
  onChange,
  placeholder,
}: {
  value: PortableTextBlock[];
  onChange: (blocks: PortableTextBlock[]) => void;
  placeholder?: string;
}) {
  const editableRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<PortableTextBlock[]>(value);

  const handleChange = useCallback((change: EditorChange) => {
    if (change.type === 'mutation') {
      latestRef.current = change.snapshot ?? latestRef.current;
    }
  }, []);

  const handleBlur = useCallback(() => {
    onChange(latestRef.current);
  }, [onChange]);

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <PortableTextEditor
        schemaType={LEGAL_SCHEMA}
        onChange={handleChange}
        value={value}
      >
        <Toolbar />
        <EditableArea
          editableRef={editableRef}
          onBlur={handleBlur}
          placeholder={placeholder}
        />
      </PortableTextEditor>
    </div>
  );
}
