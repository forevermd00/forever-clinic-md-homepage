import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@sanity/types';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { sanityFetch } from '@/lib/sanity/fetch';
import { legalDocumentQuery } from '@/lib/sanity/queries';

const titles: Record<string, string> = {
  ko: '개인정보 처리방침',
  en: 'Privacy Policy',
};

const descriptions: Record<string, string> = {
  ko: '포에버 의원 명동점 개인정보 처리방침.',
  en: 'Privacy policy for Forever Clinic Myeongdong.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = titles[locale] ?? titles.ko;
  const description = descriptions[locale] ?? descriptions.ko;
  return {
    title,
    description,
    alternates: getAlternates(locale, '/privacy'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

interface LegalDocument {
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  effectiveDate?: string;
  publicationDate?: string;
  contentKo?: PortableTextBlock[];
  contentEn?: PortableTextBlock[];
  contentZh?: PortableTextBlock[];
  contentJa?: PortableTextBlock[];
}

// ─── Fallback Portable Text blocks ───────────────────────

function p(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
    markDefs: [],
  };
}

function h3(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'h3',
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
    markDefs: [],
  };
}

function li(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    children: [{ _type: 'span', _key: 'a', text, marks: [] }],
    markDefs: [],
  };
}

const FALLBACK_KO: PortableTextBlock[] = [
  h3('제1조 (개인정보의 처리 목적)'),
  p(
    "포에버 의원 명동점(이하 '병원')은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.",
  ),
  p('1. 홈페이지 회원 가입·관리'),
  li('회원 가입 의사 확인, 회원 자격 유지·관리, 본인 식별·인증'),
  li('진료 예약 및 예약 확인, 변경, 취소 서비스 제공'),
  li('서비스 이용에 따른 불만처리, 분쟁 조정을 위한 기록 보존'),
  p('2. 진료 및 의료 서비스 제공'),
  li('피부과·성형외과·에스테틱 등 진료 예약 및 진료 서비스 제공'),
  li('의료 상담, 시술·수술 안내 및 사전 동의'),
  li('진료비 결제 및 결제 내역 확인'),
  li('처방전 발행, 진단서 등 각종 증명서 발급'),
  p('3. 마케팅 및 광고 활용 (별도 동의자에 한함)'),
  li('이벤트 및 프로모션 안내 문자·이메일·카카오톡 발송'),
  li('신규 시술 정보, 건강 정보 뉴스레터 제공'),
  li('서비스 개선을 위한 통계·분석 활용'),

  h3('제2조 (처리하는 개인정보 항목)'),
  p('병원은 다음의 개인정보 항목을 처리하고 있습니다.'),
  p('1. 회원 가입 시 수집 항목'),
  li(
    '[필수] 성명, 생년월일, 성별, 휴대전화번호, 이메일 주소, 로그인 ID, 비밀번호',
  ),
  li('[선택] 주소, 직업, 유입 경로, 관심 시술 항목'),
  p('2. 진료 예약 및 상담 시 수집 항목'),
  li('[필수] 성명, 연락처, 예약 희망 진료과목·시술명, 예약 일시'),
  li('[선택] 기존 시술 이력, 피부 타입, 특이사항, 상담 내용'),
  p('3. 의료 서비스 이용 과정에서 자동 수집 항목'),
  li('IP 주소, 쿠키, 서비스 이용기록, 방문기록, 불량 이용기록'),
  p('4. 민감정보 (의료법 및 개인정보 보호법 제23조에 따라 수집)'),
  li('진료 과정에서 수집되는 건강정보, 진료기록, 처방 내역'),
  li('시술·수술 전후 사진 (환자 서면 동의 후 수집)'),

  h3('제3조 (개인정보의 처리 및 보유 기간)'),
  p(
    '병원은 법령에 따른 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.',
  ),
  li(
    '회원 정보: 회원 탈퇴 시까지 (단, 부정 이용 방지를 위해 탈퇴 후 1년간 보관)',
  ),
  li('진료 기록: 의료법 시행규칙 제15조에 따라 최소 5년 (일부 기록은 10년)'),
  li('예약 및 상담 기록: 3년'),
  li('마케팅 수신 동의 철회 시: 즉시 파기 (단, 철회 이력은 1년 보관)'),
  li('전자상거래 거래 기록: 전자상거래법에 따라 5년'),
  li('소비자 불만·분쟁 처리 기록: 전자상거래법에 따라 3년'),

  h3('제4조 (개인정보의 제3자 제공)'),
  p(
    '병원은 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.',
  ),
  p('다음의 경우 정보주체 동의 없이 제3자에게 제공할 수 있습니다.'),
  li('「의료법」 제21조에 따른 타 의료기관으로의 진료기록 송부'),
  li(
    '「국민건강보험법」에 따른 건강보험심사평가원, 국민건강보험공단에 대한 제공',
  ),
  li('법령에 따른 수사기관의 요청이 있는 경우'),

  h3('제5조 (개인정보 처리 위탁)'),
  p(
    '병원은 원활한 서비스 제공을 위해 개인정보 처리 업무를 외부에 위탁하고 있습니다.',
  ),
  li('SMS·카카오 알림 발송: 예약 확인 문자 및 알림 발송'),
  li('홈페이지 운영·관리: 홈페이지 유지보수 및 서버 운영'),
  li('결제대행: 진료비 온라인 결제 처리'),
  p(
    '병원은 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한 등을 계약서에 명시하고 있습니다.',
  ),

  h3('제6조 (정보주체의 권리·의무 및 행사 방법)'),
  p(
    '정보주체는 병원에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.',
  ),
  li('개인정보 열람 요구'),
  li('오류 등이 있을 경우 정정 요구'),
  li('삭제 요구'),
  li('처리정지 요구'),
  p(
    '권리 행사는 서면, 전자우편, 팩스 등을 통해 하실 수 있으며, 병원은 이에 대해 지체 없이 조치하겠습니다. 진료기록 열람의 경우 「의료법」 제21조에 따라 별도의 신분 확인 절차가 필요합니다.',
  ),

  h3('제7조 (개인정보의 파기)'),
  p(
    '병원은 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.',
  ),
  li(
    '파기 절차: 파기 사유 발생 → 개인정보보호책임자 승인 → 파기 실행 → 파기 완료 기록',
  ),
  li('파기 방법(전자): 복원이 불가능한 방법으로 영구 삭제'),
  li('파기 방법(출력물): 분쇄기로 분쇄하거나 소각'),

  h3('제8조 (개인정보의 안전성 확보 조치)'),
  p(
    '병원은 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적 및 물리적 조치를 하고 있습니다.',
  ),
  li('내부관리계획 수립 및 시행'),
  li('개인정보 취급 직원의 최소화 및 교육'),
  li('개인정보에 대한 접근 제한 (접근통제시스템 운영)'),
  li('개인정보를 저장·전송하는 경우 암호화 적용'),
  li('해킹 등에 대비한 기술적 대책 (백신 프로그램, 방화벽 등)'),
  li('개인정보 처리시스템 접속기록 보관 및 위·변조 방지'),
  li('진료 공간 등 물리적 접근 통제'),

  h3('제9조 (쿠키의 운영 및 거부)'),
  p(
    '병원은 이용자에게 맞춤형 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 쿠키(Cookie)를 사용합니다.',
  ),
  p(
    '쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 컴퓨터에 저장됩니다. 이용자는 웹 브라우저의 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다. 단, 쿠키 설치를 거부하는 경우 일부 서비스 이용이 제한될 수 있습니다.',
  ),

  h3('제10조 (개인정보보호책임자)'),
  p(
    '병원은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 개인정보보호책임자를 지정하고 있습니다.',
  ),
  p('개인정보 관련 문의는 병원 대표 연락처로 연락해 주시기 바랍니다.'),

  h3('제11조 (권익침해 구제방법)'),
  p(
    '정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.',
  ),
  li(
    '개인정보 침해신고센터 (한국인터넷진흥원): privacy.kisa.or.kr / 국번 없이 118',
  ),
  li('개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972'),
  li('대검찰청 사이버범죄수사단: www.spo.go.kr / 1301'),
  li('경찰청 사이버안전국: cyberbureau.police.go.kr / 국번 없이 182'),

  h3('제12조 (개인정보처리방침의 변경)'),
  p(
    '이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가·삭제·정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지합니다. 단, 정보주체의 권리에 중요한 변경이 있는 경우에는 최소 30일 전에 공지합니다.',
  ),
];

const FALLBACK_EN: PortableTextBlock[] = [
  h3('Article 1 (Purpose of Processing Personal Information)'),
  p(
    'Forever Clinic Myeongdong (hereinafter "Clinic") processes personal information for the following purposes. Personal information will not be used for purposes other than those stated below. If the purpose changes, the Clinic will take necessary measures such as obtaining separate consent in accordance with Article 18 of the Personal Information Protection Act.',
  ),
  p('1. Website membership registration and management'),
  li(
    'Confirming intent to register, maintaining membership status, identity verification',
  ),
  li(
    'Providing appointment booking, confirmation, modification, and cancellation services',
  ),
  li('Maintaining records for complaints and dispute resolution'),
  p('2. Medical and healthcare services'),
  li(
    'Appointment booking and medical services for dermatology, plastic surgery, aesthetics, etc.',
  ),
  li('Medical consultation, procedure guidance, and prior consent'),
  li('Processing and confirming medical fee payments'),
  li('Issuing prescriptions, medical certificates, and other documents'),
  p(
    '3. Marketing and advertising (only for those who provide separate consent)',
  ),
  li('Sending event and promotion notifications via SMS, email, and KakaoTalk'),
  li('Providing new treatment information and health newsletters'),
  li('Statistical and analytical use for service improvement'),

  h3('Article 2 (Personal Information Items Processed)'),
  p('The Clinic processes the following personal information:'),
  p('1. Items collected upon membership registration'),
  li(
    '[Required] Name, date of birth, gender, mobile phone number, email address, login ID, password',
  ),
  li('[Optional] Address, occupation, referral source, treatment interests'),
  p('2. Items collected for appointments and consultations'),
  li(
    '[Required] Name, contact information, desired treatment, appointment date and time',
  ),
  li(
    '[Optional] Previous treatment history, skin type, special notes, consultation content',
  ),
  p('3. Items automatically collected during service use'),
  li(
    'IP address, cookies, service usage records, visit records, improper use records',
  ),
  p(
    '4. Sensitive information (collected pursuant to the Medical Service Act and Article 23 of the Personal Information Protection Act)',
  ),
  li(
    'Health information, medical records, and prescription details collected during treatment',
  ),
  li('Before/after procedure photos (collected after written patient consent)'),

  h3('Article 3 (Retention Period)'),
  p(
    'The Clinic processes and retains personal information within the legally required retention period.',
  ),
  li(
    'Member information: Until withdrawal (retained 1 year post-withdrawal to prevent misuse)',
  ),
  li(
    'Medical records: At least 5 years per the Medical Service Act Enforcement Rules Article 15 (some records 10 years)',
  ),
  li('Reservation and consultation records: 3 years'),
  li(
    'Upon withdrawal of marketing consent: Immediately destroyed (withdrawal history retained 1 year)',
  ),
  li('E-commerce transaction records: 5 years per the E-Commerce Act'),
  li('Consumer complaint/dispute records: 3 years per the E-Commerce Act'),

  h3('Article 4 (Third-Party Disclosure)'),
  p(
    "The Clinic processes personal information only within the scope stated in Article 1 and provides personal information to third parties only with the user's consent or as required by law (Articles 17 and 18 of the Personal Information Protection Act).",
  ),
  p(
    'Personal information may be provided to third parties without consent in the following cases:',
  ),
  li(
    'Transfer of medical records to other medical institutions per Article 21 of the Medical Service Act',
  ),
  li(
    'Provision to the Health Insurance Review and Assessment Service and National Health Insurance Service per the National Health Insurance Act',
  ),
  li('Requests from investigative agencies pursuant to applicable law'),

  h3('Article 5 (Processing Consignment)'),
  p(
    'The Clinic entrusts personal information processing to the following third parties for smooth service delivery:',
  ),
  li(
    'SMS/KakaoTalk notifications: Appointment confirmation messages and alerts',
  ),
  li(
    'Website operation and management: Website maintenance and server operation',
  ),
  li('Payment processing: Online medical fee payment processing'),
  p(
    'When entering into entrustment agreements, the Clinic specifies in contracts: prohibition of processing personal information beyond the scope of entrusted work, technical and managerial protective measures, and restrictions on re-entrustment, in accordance with Article 26 of the Personal Information Protection Act.',
  ),

  h3('Article 6 (Rights of the Data Subject)'),
  p(
    'The data subject may exercise the following rights against the Clinic at any time:',
  ),
  li('Right to access personal information'),
  li('Right to request correction of errors'),
  li('Right to request deletion'),
  li('Right to request suspension of processing'),
  p(
    'Rights may be exercised in writing, by email, or by fax, and the Clinic will respond without delay. For access to medical records, separate identity verification is required under Article 21 of the Medical Service Act.',
  ),

  h3('Article 7 (Destruction of Personal Information)'),
  p(
    'The Clinic destroys personal information without delay once the purpose of processing has been fulfilled.',
  ),
  li(
    'Destruction procedure: Grounds arise → Privacy Officer approval → Destruction executed → Destruction record kept',
  ),
  li('Electronic files: Permanently deleted using irreversible methods'),
  li('Printed materials: Shredded or incinerated'),

  h3('Article 8 (Security Measures)'),
  p(
    'The Clinic implements the following technical, administrative, and physical measures in accordance with Article 29 of the Personal Information Protection Act:',
  ),
  li('Establishment and implementation of internal management plans'),
  li(
    'Minimizing personnel handling personal information and conducting training',
  ),
  li('Restricting access to personal information (access control systems)'),
  li('Applying encryption when storing or transmitting personal information'),
  li(
    'Technical countermeasures against hacking (antivirus programs, firewalls, etc.)',
  ),
  li(
    'Maintaining and protecting access records to personal information processing systems',
  ),
  li('Physical access control to medical spaces and facilities'),

  h3('Article 9 (Cookies)'),
  p(
    'The Clinic uses cookies to store and retrieve usage information to provide personalized services.',
  ),
  p(
    "Cookies are small pieces of information sent by the server to the user's browser and stored on the user's computer. Users may accept or refuse cookies through browser settings. Refusing cookies may limit certain services.",
  ),

  h3('Article 10 (Privacy Officer)'),
  p(
    'The Clinic has designated a Privacy Officer responsible for overseeing personal information processing and handling complaints and remedies related to personal information.',
  ),
  p('For privacy-related inquiries, please contact the Clinic directly.'),

  h3('Article 11 (Remedies for Rights Violations)'),
  p(
    'For personal information violation remedies and consultations, you may contact the following agencies:',
  ),
  li(
    'Personal Information Infringement Report Center (KISA): privacy.kisa.or.kr / 118',
  ),
  li(
    'Personal Information Dispute Mediation Committee: www.kopico.go.kr / 1833-6972',
  ),
  li(
    "Supreme Prosecutors' Office Cyber Crime Investigation Division: www.spo.go.kr / 1301",
  ),
  li(
    'National Police Agency Cyber Safety Bureau: cyberbureau.police.go.kr / 182',
  ),

  h3('Article 12 (Changes to This Policy)'),
  p(
    'This Privacy Policy takes effect from the effective date. In case of additions, deletions, or corrections due to changes in laws or policy, notice will be given through announcements at least 7 days before the effective date of the change. For significant changes to user rights, notice will be given at least 30 days in advance.',
  ),
];

// ─── Portable Text Components ─────────────────────────────

const ptComponents = {
  block: {
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-6 mb-2 text-[15px] font-semibold text-[#2b2b2b] first:mt-0">
        {children}
      </h2>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-1 text-[14px] leading-[1.8] text-[#555]">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mb-2 pl-4">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="mb-2 list-decimal pl-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="mb-1 list-disc text-[14px] leading-[1.8] text-[#555]">
        {children}
      </li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="mb-1 text-[14px] leading-[1.8] text-[#555]">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
  },
};

function formatDate(dateStr: string, locale: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (locale === 'ko') return `${year}년 ${month}월 ${day}일`;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const doc = await sanityFetch<LegalDocument>(legalDocumentQuery, {
    documentType: 'privacy-policy',
  });

  const contentKo = doc?.contentKo?.length ? doc.contentKo : FALLBACK_KO;
  const contentEn = doc?.contentEn?.length ? doc.contentEn : FALLBACK_EN;
  const contentZh = doc?.contentZh?.length ? doc.contentZh : FALLBACK_EN;
  const contentJa = doc?.contentJa?.length ? doc.contentJa : FALLBACK_EN;
  const content =
    locale === 'ko'
      ? contentKo
      : locale === 'en'
        ? contentEn
        : locale === 'zh'
          ? contentZh
          : locale === 'ja'
            ? contentJa
            : contentKo;
  const effectiveDate = doc?.effectiveDate ?? '2025-04-23';
  const heading =
    doc?.title?.[locale as keyof typeof doc.title] ??
    titles[locale] ??
    titles.ko;

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[720px]">
        <h1 className="mb-2 text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
          {heading}
        </h1>
        <p className="mb-10 text-[13px] text-[#888]">
          {locale === 'ko'
            ? `시행일: ${formatDate(effectiveDate, locale)}`
            : `Effective date: ${formatDate(effectiveDate, locale)}`}
        </p>
        <div>
          <PortableText value={content} components={ptComponents} />
        </div>
      </div>
    </section>
  );
}
