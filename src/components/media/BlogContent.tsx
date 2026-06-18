import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// 마크다운 본문에서 허용할 인라인 HTML (브랜드 강조용 최소 집합)
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'mark', 'u', 'sup', 'sub'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className'],
  },
};

export function BlogContent({ value }: { value: string }) {
  if (!value?.trim()) return null;

  return (
    <div className="py-10 text-[15px] leading-[1.8] text-[#2b2b2b]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-8 mb-4 text-[22px] font-bold text-[#2b2b2b]">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-4 text-[20px] font-bold text-[#2b2b2b]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-3 text-[18px] font-semibold text-[#2b2b2b]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 text-[16px] font-semibold text-[#2b2b2b]">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="mb-4">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          mark: ({ children }) => (
            <mark className="bg-[#fff3cd] px-0.5">{children}</mark>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-[1.8]">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-[#d4c5b0] pl-4 text-[#666] italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b6f47] underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === 'string' ? (
              <figure className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ''}
                  className="w-full rounded-md"
                  loading="lazy"
                />
                {alt && (
                  <figcaption className="mt-2 text-center text-[13px] text-[#999]">
                    {alt}
                  </figcaption>
                )}
              </figure>
            ) : null,
          hr: () => <hr className="my-8 border-t border-[#efe5d9]" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[#e8e8e8] bg-[#f5f5f5] px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#e8e8e8] px-3 py-2">{children}</td>
          ),
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
