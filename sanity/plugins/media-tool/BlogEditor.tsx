import { useRef, useCallback, useState, type ReactNode } from 'react';
import {
  PortableTextEditor,
  PortableTextEditable,
  usePortableTextEditor,
  usePortableTextEditorSelection,
} from '@sanity/portable-text-editor';
import type { PortableTextBlock } from '@sanity/types';
import type { EditorChange } from '@sanity/portable-text-editor';
import type { SanityClient } from 'sanity';

// ─── Schema ───────────────────────────────────────────────

const BLOG_SCHEMA = {
  name: 'blogContent',
  type: 'array' as const,
  of: [
    {
      name: 'block',
      type: 'block' as const,
      styles: [
        { title: '본문', value: 'normal' },
        { title: '소제목', value: 'h3' },
        { title: '소소제목', value: 'h4' },
      ],
      lists: [
        { title: '• 목록', value: 'bullet' },
        { title: '번호 목록', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
        ],
        annotations: [
          {
            name: 'color',
            type: 'object' as const,
            title: '글자색',
            fields: [{ name: 'hex', type: 'string', title: 'HEX' }],
          },
        ],
      },
    },
    {
      type: 'image' as const,
      options: { hotspot: true },
    },
  ],
};

// ─── Color Presets ────────────────────────────────────────

const COLOR_PRESETS = [
  { label: '기본', hex: '' },
  { label: '빨강', hex: '#e53e3e' },
  { label: '파랑', hex: '#3182ce' },
  { label: '초록', hex: '#38a169' },
  { label: '주황', hex: '#dd6b20' },
  { label: '회색', hex: '#718096' },
];

// ─── Toolbar Button ───────────────────────────────────────

function TBtn({
  active,
  onMouseDown,
  children,
  title,
  style,
}: {
  active?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: ReactNode;
  title?: string;
  style?: React.CSSProperties;
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
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Color Dropdown ───────────────────────────────────────

function ColorPicker({ onSelect }: { onSelect: (hex: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        title="글자색"
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        style={{
          padding: '3px 10px',
          fontSize: 12,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          background: 'white',
          cursor: 'pointer',
          color: '#374151',
          lineHeight: '1.5',
          userSelect: 'none',
        }}
      >
        A<span style={{ color: '#e53e3e', fontWeight: 700 }}>색</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 80,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.hex || 'default'}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(c.hex);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 6px',
                fontSize: 12,
                border: 'none',
                borderRadius: 3,
                background: 'transparent',
                cursor: 'pointer',
                color: c.hex || '#374151',
                textAlign: 'left',
              }}
            >
              {c.hex && (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: c.hex,
                    flexShrink: 0,
                  }}
                />
              )}
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toolbar (inside PTE context) ─────────────────────────

function Toolbar({
  onInsertImage,
  uploading,
}: {
  onInsertImage: () => void;
  uploading: boolean;
}) {
  const editor = usePortableTextEditor();
  usePortableTextEditorSelection();

  const isBold = !!PortableTextEditor.isMarkActive(editor, 'strong');
  const isItalic = !!PortableTextEditor.isMarkActive(editor, 'em');
  const isH3 = !!PortableTextEditor.hasBlockStyle(editor, 'h3');
  const isH4 = !!PortableTextEditor.hasBlockStyle(editor, 'h4');
  const isBullet = !!PortableTextEditor.hasListStyle(editor, 'bullet');
  const isNumber = !!PortableTextEditor.hasListStyle(editor, 'number');

  const md = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
    PortableTextEditor.focus(editor);
  };

  const handleColorSelect = (hex: string) => {
    const colorType = editor.schemaTypes.annotations.find(
      (a) => a.name === 'color',
    );
    if (!colorType) return;
    if (!hex) {
      PortableTextEditor.removeAnnotation(editor, colorType);
    } else {
      PortableTextEditor.addAnnotation(editor, colorType, { hex });
    }
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
        title="소제목 (h3)"
        onMouseDown={md(() =>
          PortableTextEditor.toggleBlockStyle(editor, 'h3'),
        )}
      >
        소제목
      </TBtn>
      <TBtn
        active={isH4}
        title="소소제목 (h4)"
        onMouseDown={md(() =>
          PortableTextEditor.toggleBlockStyle(editor, 'h4'),
        )}
      >
        소소제목
      </TBtn>
      <div
        style={{ width: 1, height: 16, background: '#e5e7eb', margin: '0 2px' }}
      />
      <TBtn
        active={isBold}
        title="굵게"
        onMouseDown={md(() => PortableTextEditor.toggleMark(editor, 'strong'))}
      >
        <strong>B</strong>
      </TBtn>
      <TBtn
        active={isItalic}
        title="기울임"
        onMouseDown={md(() => PortableTextEditor.toggleMark(editor, 'em'))}
      >
        <em>I</em>
      </TBtn>
      <ColorPicker onSelect={handleColorSelect} />
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
      <div
        style={{ width: 1, height: 16, background: '#e5e7eb', margin: '0 2px' }}
      />
      <TBtn
        title="이미지 삽입"
        onMouseDown={(e) => {
          e.preventDefault();
          onInsertImage();
        }}
      >
        {uploading ? '업로드 중…' : '이미지 삽입'}
      </TBtn>
    </div>
  );
}

// ─── Editable Area ────────────────────────────────────────

function EditableArea({
  editableRef,
  onBlur,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
  onBlur: () => void;
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
          내용을 입력하세요…
        </span>
      )}
      renderBlock={(props) => {
        const { value, children } = props;
        if (value.style === 'h3') {
          return (
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                marginTop: 16,
                marginBottom: 4,
                color: '#1f2937',
              }}
            >
              {children}
            </div>
          );
        }
        if (value.style === 'h4') {
          return (
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                marginTop: 12,
                marginBottom: 2,
                color: '#374151',
              }}
            >
              {children}
            </div>
          );
        }
        if (value._type === 'image') {
          return (
            <div
              style={{
                margin: '8px 0',
                border: '1px dashed #d1d5db',
                borderRadius: 4,
                padding: 8,
                color: '#9ca3af',
                fontSize: 12,
              }}
            >
              [이미지]
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
        if (props.value === 'em') {
          return <em>{props.children}</em>;
        }
        return <>{props.children}</>;
      }}
      renderAnnotation={(props) => {
        if (props.schemaType.name === 'color') {
          const hex = (props.value as { hex?: string }).hex;
          return (
            <span style={{ color: hex || 'inherit' }}>{props.children}</span>
          );
        }
        return <>{props.children}</>;
      }}
    />
  );
}

// ─── Main Export ──────────────────────────────────────────

export function BlogEditor({
  client,
  value,
  onChange,
}: {
  client: SanityClient;
  value: PortableTextBlock[];
  onChange: (blocks: PortableTextBlock[]) => void;
}) {
  const editableRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef<PortableTextBlock[]>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = useCallback((change: EditorChange) => {
    if (change.type === 'mutation') {
      latestRef.current = change.snapshot ?? latestRef.current;
    }
  }, []);

  const handleBlur = useCallback(() => {
    onChange(latestRef.current);
  }, [onChange]);

  const handleInsertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        });
        const imageBlock = {
          _type: 'image' as const,
          _key: Math.random().toString(36).slice(2, 10),
          asset: { _type: 'reference' as const, _ref: asset._id },
        };
        const next = [
          ...latestRef.current,
          imageBlock as unknown as PortableTextBlock,
        ];
        latestRef.current = next;
        onChange(next);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [client, onChange],
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
      <PortableTextEditor
        schemaType={BLOG_SCHEMA}
        onChange={handleChange}
        value={value}
      >
        <Toolbar onInsertImage={handleInsertImage} uploading={uploading} />
        <EditableArea editableRef={editableRef} onBlur={handleBlur} />
      </PortableTextEditor>
    </div>
  );
}
