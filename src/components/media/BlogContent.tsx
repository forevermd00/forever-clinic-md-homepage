'use client';

import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/image';
import type { PortableTextBlock } from '@portabletext/types';

const components = {
  types: {
    image: ({
      value,
    }: {
      value: { asset: { _ref: string }; alt?: string; caption?: string };
    }) => {
      const url = urlFor(value)?.width(800).url();
      if (!url) return null;
      return (
        <figure className="my-8">
          <Image
            src={url}
            alt={value.alt || ''}
            width={800}
            height={500}
            className="w-full rounded-md"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-[13px] text-[#999]">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-8 mb-4 text-[20px] font-bold text-[#2b2b2b]">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-6 mb-3 text-[18px] font-semibold text-[#2b2b2b]">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="mt-4 mb-2 text-[16px] font-semibold text-[#2b2b2b]">
        {children}
      </h4>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-4 border-l-4 border-[#d4c5b0] pl-4 text-[#666] italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-4">{children}</p>
    ),
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode;
      value?: { href?: string };
    }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8b6f47] underline"
      >
        {children}
      </a>
    ),
  },
};

export function BlogContent({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="py-10 text-[15px] leading-[1.8] text-[#2b2b2b]">
      <PortableText value={value} components={components} />
    </div>
  );
}
