import { defineConfig } from 'sanity';
import { schemaTypes } from './src/lib/sanity/schemas';
import { consultationTool } from './sanity/plugins/consultation-tool';
import { treatmentTool } from './sanity/plugins/treatment-tool';
import { bnaAdminTool } from './sanity/plugins/bna-tool';
import { eventAdminTool } from './sanity/plugins/event-tool';
import { mediaAdminTool } from './sanity/plugins/media-tool';
import { brandAdminTool } from './sanity/plugins/brand-tool';
import { settingsAdminTool } from './sanity/plugins/settings-tool';
import { fontPlugin } from './sanity/plugins/font-plugin';

export const PAGE_HEROES = [
  { key: 'main', title: '메인' },
  { key: 'before-after', title: 'Before & After' },
  { key: 'treatments', title: '시술 안내' },
  { key: 'brand', title: '브랜드' },
  { key: 'promotions', title: '프로모션' },
  { key: 'press', title: '보도자료' },
  { key: 'video', title: '영상 콘텐츠' },
  { key: 'blog', title: '블로그' },
  { key: 'notice', title: '공지사항' },
  { key: 'estimate', title: '견적' },
  { key: 'contact', title: '예약/상담' },
];

export default defineConfig({
  name: 'forever-clinic',
  title: '포에버의원 명동점',
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'develop',
  basePath: '/studio',
  releases: { enabled: false },
  scheduledPublishing: { enabled: false },
  tools: (prev) =>
    prev.filter((tool) => tool.name !== 'releases' && tool.name !== 'desk'),
  document: {
    actions: (prev) =>
      prev.filter(({ action }) => action !== ('schedulePublish' as string)),
  },
  plugins: [
    bnaAdminTool(),
    eventAdminTool(),
    treatmentTool(),
    brandAdminTool(),
    mediaAdminTool(),
    consultationTool(),
    settingsAdminTool(),
    fontPlugin(),
  ],
  schema: {
    types: schemaTypes,
  },
});
