import { defineType, defineField } from 'sanity';

/** uid 발급용 랜덤 식별자 (예: evt-a1b2c3d4) */
function issueEventUid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 8; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `evt-${s}`;
}

export default defineType({
  name: 'eventPopup',
  title: '이벤트 팝업',
  type: 'document',

  groups: [
    { name: 'popup', title: '팝업', default: true },
    { name: 'detail', title: '상세페이지' },
    { name: 'settings', title: '설정' },
  ],

  preview: {
    select: {
      title: 'title.ko',
      startDate: 'startDate',
      endDate: 'endDate',
      media: 'pcImage',
      fallbackMedia: 'image',
    },
    prepare({ title, startDate, endDate, media, fallbackMedia }) {
      const fmt = (d?: string) => (d ? d.slice(0, 10) : '');
      const subtitle =
        startDate || endDate
          ? `${fmt(startDate)} ~ ${fmt(endDate)}`
          : '기간 미설정';
      return {
        title: title || '(제목 미입력)',
        subtitle,
        media: media || fallbackMedia,
      };
    },
  },

  fields: [
    defineField({
      name: 'title',
      title: '제목',
      description: '팝업 하단 타이틀 탭과 이벤트 카드에 표시됩니다',
      type: 'localizedString',
      group: ['popup', 'detail'],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'uid',
      title: '이벤트 고유 주소 (uid)',
      description:
        '상세페이지 endpoint 입니다. "Generate"를 눌러 자동 발급하세요. 한 번 발급하면 바꾸지 마세요(공유 링크가 깨질 수 있음).',
      type: 'slug',
      group: 'settings',
      options: {
        source: issueEventUid,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 64),
      },
      validation: (rule) => rule.required(),
    }),

    // ── 팝업 ──
    defineField({
      name: 'pcImage',
      title: 'PC 팝업 이미지 (다국어)',
      description:
        'PC에서 노출되는 팝업 이미지 (가로형 권장). 언어별로 등록, 미등록 시 한국어 폴백.',
      type: 'localizedImage',
      group: 'popup',
    }),
    defineField({
      name: 'mobileImage',
      title: '모바일 팝업 이미지 (다국어)',
      description:
        '모바일에서 노출되는 팝업 이미지 (세로형 권장). 언어별로 등록, 미등록 시 한국어 폴백.',
      type: 'localizedImage',
      group: 'popup',
    }),
    defineField({
      name: 'image',
      title: '(구) 팝업 이미지',
      description:
        'PC/모바일 이미지를 입력하지 않은 경우의 폴백 이미지입니다. 가급적 위의 PC/모바일 이미지를 사용하세요.',
      type: 'image',
      options: { hotspot: true },
      group: 'popup',
    }),

    // ── 상세페이지 ──
    defineField({
      name: 'oneLineDescription',
      title: '한 줄 설명',
      description: '카드와 상세페이지 상단에 노출되는 짧은 설명',
      type: 'localizedString',
      group: 'detail',
    }),
    defineField({
      name: 'startDate',
      title: '이벤트 시작일',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
      group: 'detail',
    }),
    defineField({
      name: 'endDate',
      title: '이벤트 종료일',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' },
      group: 'detail',
    }),
    defineField({
      name: 'description',
      title: '상세 설명 (선택)',
      description: '상세페이지 본문에 노출되는 긴 설명',
      type: 'localizedText',
      group: 'detail',
    }),
    defineField({
      name: 'linkedTreatments',
      title: '연결 이벤트 시술',
      description:
        '시술별로 노출할 가격 옵션까지 선택합니다. 상세페이지 하단 시술 선택 창에 노출되어 견적에 담을 수 있습니다.',
      type: 'array',
      of: [{ type: 'eventTreatmentLink' }],
      group: 'detail',
    }),

    // ── 설정 ──
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      description: '체크 해제 시 팝업과 이벤트 메뉴에서 모두 숨깁니다',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
    defineField({
      name: 'showAsPopup',
      title: '메인 진입 시 팝업 노출',
      description: '체크 시 메인 페이지 진입 시 팝업으로 노출됩니다.',
      type: 'boolean',
      initialValue: true,
      group: 'settings',
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 팝업/목록에서 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      group: 'settings',
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
