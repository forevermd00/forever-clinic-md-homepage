/**
 * Sanity clinicInfo에 email + snsLinks 더미 데이터 주입
 * 실행: SANITY_API_TOKEN=<token> node scripts/patch-clinic-email-sns.mjs
 */
import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('SANITY_API_TOKEN 환경변수가 필요합니다');
  process.exit(1);
}

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-05-13',
  useCdn: false,
  token,
});

const CLINIC_INFO_ID = 'forever-myeongdong-clinic-info';

async function main() {
  const existing = await client.fetch(
    `*[_type == "clinicInfo" && _id == $id][0] { _id, email, snsLinks }`,
    { id: CLINIC_INFO_ID },
  );

  if (!existing) {
    console.error(`clinicInfo 문서를 찾을 수 없음: ${CLINIC_INFO_ID}`);
    process.exit(1);
  }

  console.log('현재 데이터:', JSON.stringify(existing, null, 2));

  const result = await client
    .patch(CLINIC_INFO_ID)
    .set({
      email: 'info@forever-clinic.com',
      snsLinks: [
        {
          _key: 'sns-instagram',
          platform: 'instagram',
          url: 'https://instagram.com/forever_clinic_myeongdong',
          label: 'Instagram',
        },
        {
          _key: 'sns-kakao',
          platform: 'kakao',
          url: 'https://pf.kakao.com/_forever',
          label: 'KakaoTalk',
        },
      ],
    })
    .commit();

  console.log('패치 완료:', result._id);
}

main().catch((err) => {
  console.error('오류:', err.message);
  process.exit(1);
});
