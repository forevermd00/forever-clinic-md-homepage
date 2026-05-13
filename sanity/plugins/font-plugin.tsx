import React, { useEffect } from 'react';
import { definePlugin, LayoutProps } from 'sanity';

const FONT_FAMILY =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

function PretendardLayout(props: LayoutProps) {
  useEffect(() => {
    if (!document.getElementById('pretendard-studio-font')) {
      const link = document.createElement('link');
      link.id = 'pretendard-studio-font';
      link.rel = 'stylesheet';
      link.href = '/pretendard/pretendardvariable-dynamic-subset.css';
      document.head.appendChild(link);
    }

    let style = document.getElementById(
      'pretendard-studio-override',
    ) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'pretendard-studio-override';
      document.head.appendChild(style);
    }
    style.textContent = `
      * {
        font-family: ${FONT_FAMILY} !important;
      }
      html, body {
        overscroll-behavior-x: auto;
      }
    `;
  }, []);

  return <>{props.renderDefault(props)}</>;
}

export const fontPlugin = definePlugin({
  name: 'pretendard-font',
  studio: {
    components: {
      layout: PretendardLayout,
    },
  },
});
