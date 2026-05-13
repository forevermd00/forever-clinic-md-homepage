import React, { useEffect } from 'react';
import { definePlugin, LayoutProps } from 'sanity';

const FONT_FAMILY =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

function PretendardLayout(props: LayoutProps) {
  useEffect(() => {
    const existing = document.getElementById('pretendard-studio-font');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'pretendard-studio-font';
    link.rel = 'stylesheet';
    link.href = '/pretendard/pretendardvariable-dynamic-subset.css';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'pretendard-studio-override';
    style.textContent = `
      .sanity-studio, [data-ui-theme], [data-sanity] {
        font-family: ${FONT_FAMILY} !important;
      }
      input, select, textarea, button {
        font-family: ${FONT_FAMILY} !important;
      }
    `;
    document.head.appendChild(style);
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
