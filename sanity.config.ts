import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import {
  UsersIcon,
  ImagesIcon,
  HomeIcon,
  CogIcon,
  ComposeIcon,
  BulbOutlineIcon,
  BlockContentIcon,
  DocumentTextIcon,
  PlayIcon,
  BellIcon,
  EarthGlobeIcon,
  StackCompactIcon,
  ComponentIcon,
  StarIcon,
  ImageIcon,
  ToggleArrowRightIcon,
} from '@sanity/icons';
import { schemaTypes } from './src/lib/sanity/schemas';
import { consultationTool } from './sanity/plugins/consultation-tool';
import { treatmentTool } from './sanity/plugins/treatment-tool';

const singletonTypes = new Set([
  'clinicInfo',
  'brandPhilosophy',
  'statsStrip',
  'pageHero',
  'sectionVisibility',
]);

const PAGE_HEROES = [
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
  title: '포에버 클리닉 명동',
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'develop',
  basePath: '/studio',
  releases: { enabled: false },
  scheduledPublishing: { enabled: false },
  tools: (prev) => prev.filter((tool) => tool.name !== 'releases'),
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => !singletonTypes.has(templateItem.templateId),
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      // 모든 문서에서 scheduled publishing 제거
      let actions = prev.filter(
        ({ action }) => action !== ('schedulePublish' as string),
      );
      if (singletonTypes.has(schemaType)) {
        actions = actions.filter(
          ({ action }) => action !== 'duplicate' && action !== 'delete',
        );
      }
      return actions;
    },
  },
  plugins: [
    structureTool({
      title: '콘텐츠',
      structure: (S, context) =>
        S.list()
          .id('root')
          .title('포에버 클리닉 관리')
          .items([
            // --- 자주 수정하는 항목 ---
            orderableDocumentListDeskItem({
              type: 'doctor',
              title: '의료진 관리',
              icon: UsersIcon,
              S,
              context,
            }),
            S.documentTypeListItem('baCase')
              .title('Before & After')
              .icon(ImagesIcon),

            S.divider(),

            // --- 미디어 ---
            S.documentTypeListItem('blogPost')
              .title('블로그')
              .icon(ComposeIcon),
            S.documentTypeListItem('pressArticle')
              .title('보도자료')
              .icon(DocumentTextIcon),
            S.documentTypeListItem('youtubeVideo')
              .title('영상 콘텐츠')
              .icon(PlayIcon),
            S.documentTypeListItem('notice').title('공지사항').icon(BellIcon),

            S.divider(),

            // --- 병원 정보 ---
            S.listItem()
              .id('clinic')
              .title('병원 정보')
              .icon(HomeIcon)
              .child(
                S.list()
                  .id('clinic-list')
                  .title('병원 정보')
                  .items([
                    S.listItem()
                      .id('clinicInfo')
                      .title('기본 정보')
                      .icon(EarthGlobeIcon)
                      .child(
                        S.document()
                          .schemaType('clinicInfo')
                          .documentId('forever-myeongdong-clinic-info'),
                      ),
                    orderableDocumentListDeskItem({
                      type: 'facility',
                      title: '시설 안내',
                      icon: HomeIcon,
                      S,
                      context,
                    }),
                    orderableDocumentListDeskItem({
                      type: 'equipment',
                      title: '장비 안내',
                      icon: ComponentIcon,
                      S,
                      context,
                    }),
                  ]),
              ),

            // --- 히어로 배너 (페이지별 고정) ---
            S.listItem()
              .id('heroes')
              .title('히어로 배너')
              .icon(ImageIcon)
              .child(
                S.list()
                  .id('heroes-list')
                  .title('히어로 배너')
                  .items(
                    PAGE_HEROES.map((page) =>
                      S.listItem()
                        .id(`hero-${page.key}`)
                        .title(page.title)
                        .icon(ImageIcon)
                        .child(
                          S.document()
                            .schemaType('pageHero')
                            .documentId(`page-hero-${page.key}`)
                            .title(`히어로 — ${page.title}`)
                            .initialValueTemplate(`pageHero-${page.key}`),
                        ),
                    ),
                  ),
              ),

            // --- 사이트 설정 ---
            S.listItem()
              .id('settings')
              .title('사이트 설정')
              .icon(CogIcon)
              .child(
                S.list()
                  .id('settings-list')
                  .title('사이트 설정')
                  .items([
                    S.listItem()
                      .id('brandPhilosophy')
                      .title('브랜드 철학')
                      .icon(BulbOutlineIcon)
                      .child(
                        S.document()
                          .schemaType('brandPhilosophy')
                          .documentId('forever-myeongdong-brand'),
                      ),
                    S.listItem()
                      .id('statsStrip')
                      .title('통계 수치')
                      .icon(BlockContentIcon)
                      .child(
                        S.document()
                          .schemaType('statsStrip')
                          .documentId('forever-myeongdong-stats'),
                      ),
                    S.documentTypeListItem('quickEntryTab')
                      .title('빠른 탐색 탭')
                      .icon(StackCompactIcon),
                    S.documentTypeListItem('quickEntryCard')
                      .title('빠른 탐색 카드')
                      .icon(ComponentIcon),
                    S.documentTypeListItem('eventPopup')
                      .title('이벤트 팝업')
                      .icon(StarIcon),
                  ]),
              ),

            S.divider(),

            // --- 섹션 노출 설정 (싱글톤) ---
            S.listItem()
              .id('sectionVisibility')
              .title('섹션 노출 설정')
              .icon(ToggleArrowRightIcon)
              .child(
                S.document()
                  .schemaType('sectionVisibility')
                  .documentId('sectionVisibility'),
              ),
          ]),
    }),
    consultationTool(),
    treatmentTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => t.schemaType !== 'pageHero'),
      ...PAGE_HEROES.map((page) => ({
        id: `pageHero-${page.key}`,
        title: `히어로 — ${page.title}`,
        schemaType: 'pageHero' as const,
        value: { pageName: page.title },
      })),
    ],
  },
});
