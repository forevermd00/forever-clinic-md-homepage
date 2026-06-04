import { defineType, defineField, defineArrayMember } from 'sanity';
import { LocationInput } from '@/lib/sanity/components/LocationInput';

export default defineType({
  name: 'clinicInfo',
  title: '병원 정보',
  type: 'document',

  preview: {
    prepare() {
      return { title: '포에버의원 명동점 — 병원 정보' };
    },
  },

  fields: [
    // ── 위치 좌표 (주소 검색) ──────────────────────────────────
    defineField({
      name: 'locationCoordinates',
      title: '위치 좌표',
      description: '주소 검색 버튼으로 자동 입력 — 지도 표시에 사용',
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
  ],
});
