import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/lib/sanity/schemas';

const singletonTypes = new Set([
  'clinicInfo',
  'heroContent',
  'brandPhilosophy',
  'statsStrip',
]);

export default defineConfig({
  name: 'forever-clinic',
  title: '포에버 클리닉 명동',
  projectId: 'qypqbkyi',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'develop',
  basePath: '/studio',
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
      if (singletonTypes.has(schemaType)) {
        return prev.filter(({ action }) => action !== 'duplicate');
      }
      return prev;
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('콘텐츠 관리')
          .items([
            S.listItem()
              .id('content')
              .title('콘텐츠 관리')
              .child(
                S.list()
                  .id('content-list')
                  .title('콘텐츠 관리')
                  .items([
                    S.documentTypeListItem('treatment').title('시술 관리'),
                    S.documentTypeListItem('doctor').title('의료진 관리'),
                    S.documentTypeListItem('promotion').title(
                      '프로모션/이벤트',
                    ),
                    S.documentTypeListItem('baCase').title('Before & After'),
                  ]),
              ),
            S.listItem()
              .id('clinic')
              .title('병원 정보')
              .child(
                S.list()
                  .id('clinic-list')
                  .title('병원 정보')
                  .items([
                    S.listItem()
                      .id('clinicInfo')
                      .title('기본 정보')
                      .child(
                        S.document()
                          .schemaType('clinicInfo')
                          .documentId('forever-myeongdong-clinic-info'),
                      ),
                    S.documentTypeListItem('facility').title('시설 안내'),
                    S.documentTypeListItem('equipment').title('장비 안내'),
                  ]),
              ),
            S.listItem()
              .id('media')
              .title('미디어')
              .child(
                S.list()
                  .id('media-list')
                  .title('미디어')
                  .items([
                    S.documentTypeListItem('blogPost').title('블로그'),
                    S.documentTypeListItem('pressArticle').title('보도자료'),
                    S.documentTypeListItem('youtubeVideo').title('영상 콘텐츠'),
                    S.documentTypeListItem('notice').title('공지사항'),
                  ]),
              ),
            S.listItem()
              .id('settings')
              .title('사이트 설정')
              .child(
                S.list()
                  .id('settings-list')
                  .title('사이트 설정')
                  .items([
                    S.listItem()
                      .id('heroContent')
                      .title('히어로 배너')
                      .child(
                        S.document()
                          .schemaType('heroContent')
                          .documentId('forever-myeongdong-hero'),
                      ),
                    S.listItem()
                      .id('brandPhilosophy')
                      .title('브랜드 철학')
                      .child(
                        S.document()
                          .schemaType('brandPhilosophy')
                          .documentId('forever-myeongdong-brand'),
                      ),
                    S.listItem()
                      .id('statsStrip')
                      .title('통계 수치')
                      .child(
                        S.document()
                          .schemaType('statsStrip')
                          .documentId('forever-myeongdong-stats'),
                      ),
                    S.documentTypeListItem('quickEntryCard').title(
                      '빠른 탐색 카드',
                    ),
                    S.documentTypeListItem('eventPopup').title('이벤트 팝업'),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('contactInquiry').title('상담 문의 내역'),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
