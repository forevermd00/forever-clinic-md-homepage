import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'treatment',
  title: '시술 관리',
  type: 'document',
  preview: {
    select: { title: 'name.ko', subtitle: 'category', media: 'thumbnail' },
    prepare({ title, subtitle, media }) {
      const categoryLabels: Record<string, string> = {
        signature: '시그니처',
        'lifting-laser': '리프팅·레이저',
        'petit-lifting': '쁘띠 & 실리프팅',
        skincare: '피부 관리',
        'skin-booster': '스킨부스터',
        'hair-removal': '제모',
        anesthesia: '마취',
      };
      return {
        title: title || '(시술명 미입력)',
        subtitle: categoryLabels[subtitle] || subtitle,
        media,
      };
    },
  },
  fields: [
    defineField({
      name: 'name',
      title: '시술명',
      description: '4개 언어로 시술 이름을 입력하세요',
      type: 'localizedString',
    }),
    defineField({
      name: 'slug',
      title: 'URL 주소',
      description: '영문으로 자동 생성됩니다',
      type: 'slug',
      options: {
        source: 'name.en',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'category',
      title: '카테고리',
      description: '시술이 속하는 카테고리',
      type: 'string',
      options: {
        list: [
          { title: '시그니처', value: 'signature' },
          { title: '리프팅·레이저', value: 'lifting-laser' },
          { title: '쁘띠 & 실리프팅', value: 'petit-lifting' },
          { title: '피부 관리', value: 'skincare' },
          { title: '스킨부스터', value: 'skin-booster' },
          { title: '제모', value: 'hair-removal' },
          { title: '마취', value: 'anesthesia' },
        ],
      },
    }),
    defineField({
      name: 'thumbnail',
      title: '대표 이미지',
      description: '시술 카드에 표시되는 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'detailImages',
      title: '상세 이미지',
      description: '시술 상세 페이지에 표시됩니다',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'tagline',
      title: '한줄 소개',
      type: 'localizedString',
    }),
    defineField({
      name: 'effects',
      title: '시술 효과',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'duration',
      title: '지속 기간',
      description: '예: 6개월~1년',
      type: 'string',
    }),
    defineField({
      name: 'downtime',
      title: '다운타임',
      description: '예: 없음, 1~2일',
      type: 'string',
    }),
    defineField({
      name: 'treatmentTime',
      title: '시술 시간',
      description: '예: 약 30분',
      type: 'string',
    }),
    defineField({
      name: 'priceOptions',
      title: '가격 옵션',
      description: '회차별 가격을 설정하세요',
      type: 'array',
      of: [defineArrayMember({ type: 'priceOption' })],
    }),
    defineField({
      name: 'features',
      title: '시술 특징 (기대 효과)',
      description: '• 이런 변화를 기대할 수 있어요 (list)',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'recommendedFor',
      title: '추천 대상 (이런 고민이 있다면)',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'precautions',
      title: '주의사항',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'procedure',
      title: '시술 과정',
      description: '순서대로 입력 (STEP 1, 2, 3...)',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'faq',
      title: '자주 묻는 질문',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
    }),
    defineField({
      name: 'relatedTreatments',
      title: '관련 시술',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'treatment' }],
        }),
      ],
    }),
    defineField({
      name: 'keywords',
      title: '타깃 키워드',
      description:
        '시그니처 프로그램에서 사용하는 키워드 (예: 강한 리프팅 · 턱라인)',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: '상세 설명',
      description: '시그니처 프로그램 상세 설명 (일반 시술은 tagline 사용)',
      type: 'localizedText',
    }),
    defineField({
      name: 'composition',
      title: '구성 시술 (선택)',
      description: '시그니처 프로그램 구성 시술 목록',
      type: 'localizedText',
    }),
    defineField({
      name: 'isSignature',
      title: '시그니처 프로그램',
      description: '홈 시그니처 섹션에 표시합니다',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      description: '체크 해제 시 홈페이지에서 숨깁니다',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInMenu',
      title: '메인 홈에 표시',
      description: '상단 네비게이션 메뉴에 표시합니다',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
