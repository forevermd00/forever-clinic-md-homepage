import { defineType, defineField, defineArrayMember } from 'sanity';
import { LocationInput } from '@/lib/sanity/components/LocationInput';

export default defineType({
  name: 'clinicInfo',
  title: '병원 정보',
  type: 'document',

  preview: {
    prepare() {
      return { title: '포에버 클리닉 명동 — 병원 정보' };
    },
  },

  fields: [
    defineField({
      name: 'address',
      title: '주소',
      type: 'localizedString',
    }),
    defineField({
      name: 'phone',
      title: '전화번호',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: '이메일',
      type: 'string',
    }),
    defineField({
      name: 'businessHours',
      title: '진료 시간',
      type: 'array',
      of: [defineArrayMember({ type: 'businessHours' })],
    }),
    defineField({
      name: 'closedDayNotice',
      title: '휴진 안내',
      type: 'localizedString',
    }),
    defineField({
      name: 'googleMapsEmbedUrl',
      title: 'Google Maps URL',
      description: 'Google Maps 임베드용 URL',
      type: 'url',
    }),
    defineField({
      name: 'walkingGuide',
      title: '도보 안내',
      type: 'localizedText',
    }),
    defineField({
      name: 'snsLinks',
      title: 'SNS 링크',
      type: 'array',
      of: [defineArrayMember({ type: 'snsLink' })],
    }),
    defineField({
      name: 'messengerLinks',
      title: '메신저 링크',
      type: 'array',
      of: [defineArrayMember({ type: 'snsLink' })],
    }),

    // ── 위치 좌표 ──────────────────────────────────────────────
    defineField({
      name: 'locationCoordinates',
      title: '위치 좌표',
      description: '주소 검색 버튼으로 자동 입력',
      type: 'object',
      components: { input: LocationInput },
      fields: [
        defineField({
          name: 'searchAddress',
          title: '검색 주소',
          type: 'string',
        }),
        defineField({ name: 'latitude', title: '위도', type: 'number' }),
        defineField({ name: 'longitude', title: '경도', type: 'number' }),
      ],
    }),

    // ── 상담 섹션 설정 ──────────────────────────────────────────
    defineField({
      name: 'contactHeaderTitle',
      title: '상담 섹션 — 제목',
      description: '예: 상담 문의',
      type: 'localizedString',
    }),
    defineField({
      name: 'contactHeaderSubtitle',
      title: '상담 섹션 — 부제목',
      description: '예: 궁금하신 점이 있으시면 편하게 문의해 주세요',
      type: 'localizedString',
    }),
    defineField({
      name: 'contactHeaderBgColor',
      title: '상담 헤더 배경색',
      description: 'HEX 코드 (예: #1a1a1a)',
      type: 'string',
    }),
    defineField({
      name: 'contactAccentColor',
      title: '상담 섹션 강조색',
      description: 'HEX 코드 (예: #a83c44) — 체크박스, 링크 색상',
      type: 'string',
    }),
  ],
});
