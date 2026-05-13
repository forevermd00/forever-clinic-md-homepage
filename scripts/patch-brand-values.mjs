import { createClient } from '@sanity/client';

const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'develop',
  token,
  apiVersion: '2026-05-13',
  useCdn: false,
});

const values = [
  {
    _key: 'honesty',
    title: {
      _type: 'localizedString',
      ko: '정직',
      en: 'Honesty',
      zh: '诚信',
      ja: '誠実',
    },
    description: {
      _type: 'localizedString',
      ko: '투명한 시술 정보 공개와 정량 기준 준수로 환자와의 신뢰를 구축합니다',
      en: 'We build trust with patients through transparent treatment information and adherence to quantitative standards',
      zh: '通过透明的治疗信息公开和遵守定量标准来建立与患者的信任',
      ja: '透明な施術情報の公開と定量基準の遵守で患者様との信頼を構築します',
    },
  },
  {
    _key: 'precision',
    title: {
      _type: 'localizedString',
      ko: '정교',
      en: 'Precision',
      zh: '精细',
      ja: '精密',
    },
    description: {
      _type: 'localizedString',
      ko: '밀리미터 단위의 정밀한 시술 설계로 자연스러운 결과를 추구합니다',
      en: 'We pursue natural results through millimeter-precise treatment planning',
      zh: '通过毫米级精密治疗设计追求自然的效果',
      ja: 'ミリ単位の精密な施術設計で自然な結果を追求します',
    },
  },
  {
    _key: 'expertise',
    title: {
      _type: 'localizedString',
      ko: '전문',
      en: 'Expertise',
      zh: '专业',
      ja: '専門',
    },
    description: {
      _type: 'localizedString',
      ko: '피부과 전문의의 깊은 학술 역량과 풍부한 임상 경험이 뒷받침됩니다',
      en: 'Backed by deep academic expertise and extensive clinical experience of dermatology specialists',
      zh: '以皮肤科专家的深厚学术能力和丰富临床经验为后盾',
      ja: '皮膚科専門医の深い学術的力量と豊富な臨床経験が裏付けとなります',
    },
  },
  {
    _key: 'dignity',
    title: {
      _type: 'localizedString',
      ko: '존엄',
      en: 'Dignity',
      zh: '尊严',
      ja: '尊厳',
    },
    description: {
      _type: 'localizedString',
      ko: '환자 한 분 한 분의 고유한 아름다움을 존중하는 시술 철학입니다',
      en: 'A treatment philosophy that respects the unique beauty of each patient',
      zh: '尊重每位患者独特之美的治疗理念',
      ja: '患者様お一人おひとりの固有の美しさを尊重する施術哲学です',
    },
  },
];

async function main() {
  // First check if document exists
  const existing = await client.fetch(
    `*[_type == "brandPhilosophy" && _id == "forever-myeongdong-brand"][0] { _id, values }`,
  );

  if (!existing) {
    console.log('Brand document not found, creating...');
    await client.createOrReplace({
      _id: 'forever-myeongdong-brand',
      _type: 'brandPhilosophy',
      title: {
        _type: 'localizedString',
        ko: '영원한 아름다움, 포에버 클리닉',
        en: 'Timeless Beauty, Forever Clinic',
        zh: '永恒之美，Forever Clinic',
        ja: '永遠の美しさ、フォーエバークリニック',
      },
      subtitle: {
        _type: 'localizedString',
        ko: '과학과 예술이 만나는 피부 의학',
        en: 'Dermatology where science meets art',
        zh: '科学与艺术相遇的皮肤医学',
        ja: '科学とアートが出会う皮膚医学',
      },
      content: {
        _type: 'localizedText',
        ko: '포에버 클리닉은 최신 의료 기술과 풍부한 임상 경험을 바탕으로, 환자 한 분 한 분에게 최적화된 맞춤 시술을 제공합니다.',
        en: 'Forever Clinic provides personalized treatments optimized for each patient, backed by cutting-edge medical technology and extensive clinical experience.',
        zh: 'Forever Clinic基于最新医疗技术和丰富的临床经验，为每位患者提供优化的定制治疗方案。',
        ja: 'フォーエバークリニックは最新の医療技術と豊富な臨床経験を基に、患者様お一人おひとりに最適化されたオーダーメイド施術を提供します。',
      },
      values,
    });
    console.log('Created brand document with values.');
  } else {
    console.log('Patching existing brand document values...');
    await client.patch('forever-myeongdong-brand').set({ values }).commit();
    console.log('Patched brand values successfully.');
    console.log('Values injected:', values.map((v) => v.title.ko).join(', '));
  }
}

main().catch(console.error);
