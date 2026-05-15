import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@sanity/types';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { sanityFetch } from '@/lib/sanity/fetch';
import { legalDocumentQuery } from '@/lib/sanity/queries';

const titles: Record<string, string> = {
  ko: '이용약관',
  en: 'Terms of Service',
};

const descriptions: Record<string, string> = {
  ko: '포에버 의원 명동점 이용약관.',
  en: 'Terms of service for Forever Clinic Myeongdong.',
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
    alternates: getAlternates(locale, '/terms'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

interface LegalDocument {
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
  h3('제1조 (목적)'),
  p(
    "이 약관은 포에버 의원 명동점(이하 '병원'이라 합니다)이 운영하는 인터넷 홈페이지(이하 '사이트'라 합니다)에서 제공하는 온라인 서비스의 이용과 관련하여 병원과 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.",
  ),

  h3('제2조 (정의)'),
  p('이 약관에서 사용하는 용어의 정의는 다음과 같습니다.'),
  li(
    "'사이트'란 병원이 서비스를 이용자에게 제공하기 위하여 운영하는 인터넷 홈페이지를 의미합니다.",
  ),
  li(
    "'이용자'란 사이트에 접속하여 이 약관에 따라 서비스를 받는 회원 및 비회원을 의미합니다.",
  ),
  li("'회원'이란 병원에 개인정보를 제공하고 회원등록을 한 자를 의미합니다."),
  li("'비회원'이란 회원에 가입하지 않고 서비스를 이용하는 자를 의미합니다."),
  li(
    "'진료 예약 서비스'란 사이트를 통해 진료 일정을 사전에 예약하는 서비스를 의미합니다.",
  ),
  li(
    "'콘텐츠'란 사이트에 게시된 텍스트, 이미지, 영상, 시술·수술 정보, 의료진 정보 등 모든 자료를 의미합니다.",
  ),

  h3('제3조 (약관의 효력 및 변경)'),
  li(
    '이 약관은 사이트 초기화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.',
  ),
  li(
    '병원은 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지함으로써 효력이 발생합니다.',
  ),
  li(
    '약관이 변경되는 경우 변경 시행 7일 전부터 사이트 공지사항을 통해 공지합니다. 단, 이용자의 권리·의무에 중대한 변경이 있는 경우에는 30일 전에 공지합니다.',
  ),
  li(
    '이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 변경 공지 후 7일 이내에 거부 의사를 명시하지 않으면 변경 약관에 동의한 것으로 간주합니다.',
  ),

  h3('제4조 (서비스의 내용)'),
  p('병원은 다음의 서비스를 제공합니다.'),
  li('진료 예약 및 예약 확인·변경·취소 서비스'),
  li('의료진 소개 및 진료 안내 정보 제공'),
  li('시술·수술 정보(피부과, 성형외과, 에스테틱 등) 제공'),
  li('이벤트, 공지사항 및 건강 정보 제공'),
  li('온라인 상담 문의 접수'),
  li('기타 병원이 정하는 서비스'),

  h3('제5조 (서비스 이용)'),
  li(
    '서비스 이용시간은 병원의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.',
  ),
  li(
    '병원은 컴퓨터 등 정보통신설비의 보수점검, 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.',
  ),
  li('서비스 이용 중단 시 병원은 사전에 사이트 공지사항을 통해 통지합니다.'),

  h3('제6조 (회원 가입)'),
  li(
    '이용자는 병원이 정한 가입 양식에 따라 정보를 기입한 후 이 약관에 동의함으로써 회원 가입을 신청합니다.',
  ),
  p(
    '병원은 다음 각 호의 사유가 있는 경우 회원 가입을 거부하거나 사후에 회원 자격을 취소할 수 있습니다.',
  ),
  li('이전에 회원 자격을 상실한 적이 있는 경우'),
  li('허위 또는 타인의 정보를 기재한 경우'),
  li('만 14세 미만인 경우 (법정 대리인의 동의 없이 가입 신청한 경우)'),
  li('기타 이 약관에 위배되거나 위법·부당한 행위를 하는 경우'),

  h3('제7조 (회원의 아이디 및 비밀번호 관리)'),
  li(
    '회원의 아이디와 비밀번호에 관한 관리 책임은 회원에게 있으며, 이를 제3자가 이용하도록 해서는 안 됩니다.',
  ),
  li(
    '회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우 즉시 병원에 통보하고 병원의 안내에 따라야 합니다.',
  ),
  li(
    '병원에 통보하지 않거나 통보한 경우에도 병원의 안내에 따르지 않아 발생한 불이익에 대해 병원은 책임지지 않습니다.',
  ),

  h3('제8조 (이용자의 의무)'),
  p('이용자는 다음 각 호의 행위를 하여서는 안 됩니다.'),
  li('신청 또는 변경 시 허위 내용의 등록'),
  li('타인의 정보 도용'),
  li('병원이 게시한 정보의 변경'),
  li('병원 및 기타 제3자의 저작권 등 지식재산권에 대한 침해'),
  li('병원 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위'),
  li('음란하거나 폭력적인 내용을 사이트에 게시하는 행위'),
  li('병원의 동의 없이 영리를 목적으로 서비스를 사용하는 행위'),
  li('기타 불법적이거나 부당한 행위'),

  h3('제9조 (온라인 상담 및 예약 서비스 이용 안내)'),
  li(
    '온라인 상담 및 예약 서비스는 실제 진료를 대체하지 않으며, 의학적 진단이나 치료의 의미를 갖지 않습니다.',
  ),
  li(
    '진료 예약은 예약 확정 시점부터 효력이 발생하며, 병원의 사정에 따라 예약이 변경될 수 있습니다.',
  ),
  li(
    '예약 변경 또는 취소를 원하는 경우, 예약일 전날 진료시간 종료 전까지 병원에 연락하여 주시기 바랍니다. 무단 예약 불이행이 반복되는 경우 서비스 이용이 제한될 수 있습니다.',
  ),
  li(
    '비급여 진료비용은 의료법 제45조에 따라 병원 내 원내 고지를 통해 안내하며, 홈페이지 게시 정보와 실제 비용이 차이가 있을 수 있으므로 내원 전 반드시 확인하시기 바랍니다.',
  ),

  h3('제10조 (시술·수술 정보 콘텐츠 관련 고지)'),
  p(
    '본 사이트에 게재된 피부과·성형외과·에스테틱 시술 정보는 의료광고법(의료법 제56조)에 따라 작성되었으며, 일반적인 정보 제공 목적으로만 활용됩니다.',
  ),
  li(
    '사이트에 게재된 시술·수술 정보는 일반적인 정보 제공 목적이며, 의학적 진단·치료 행위가 아닙니다.',
  ),
  li(
    '시술·수술의 효과는 개인에 따라 다를 수 있으며, 사이트에 기재된 내용이 모든 환자에게 동일하게 적용되지 않습니다.',
  ),
  li(
    '시술 전후 사진이 게시된 경우, 해당 환자의 서면 동의를 받은 자료이며 시술 후 3개월 이상 경과된 결과물입니다.',
  ),
  li(
    '시술 관련 상세 상담 및 구체적인 견적은 반드시 의료진과 직접 상담을 통해 결정하여야 합니다.',
  ),

  h3('제11조 (저작권 및 지식재산권)'),
  li(
    '병원이 작성한 저작물에 대한 저작권 및 기타 지식재산권은 병원에 귀속됩니다.',
  ),
  li(
    '이용자는 사이트를 이용함으로써 얻은 정보를 병원의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송, 기타 방법으로 영리 목적으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.',
  ),

  h3('제12조 (면책 조항)'),
  li(
    '병원은 천재지변, 전쟁, 기간통신사업자의 서비스 중지 및 기타 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.',
  ),
  li(
    '병원은 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.',
  ),
  li(
    '사이트에 게재된 의료 정보는 참고용이며, 이를 근거로 한 이용자의 독자적인 의료 판단으로 인한 결과에 대해 병원은 책임을 지지 않습니다.',
  ),

  h3('제13조 (분쟁 해결 및 관할 법원)'),
  li(
    '병원과 이용자 간에 발생한 분쟁은 상호 협의하여 해결함을 원칙으로 합니다.',
  ),
  li(
    '이 약관에 관한 소송의 합의 관할 법원은 병원 소재지를 관할하는 법원으로 합니다.',
  ),
  li('이 약관과 관련하여 적용되는 법령은 대한민국 법령으로 합니다.'),

  h3('제14조 (기타)'),
  li(
    '이 약관에 명시되지 않은 사항은 관련 법령 및 병원이 정한 세부 이용지침 등의 규정에 따릅니다.',
  ),
  li('이 약관의 일부가 무효인 경우에도 나머지 조항은 유효하게 존속합니다.'),
];

const FALLBACK_EN: PortableTextBlock[] = [
  h3('Article 1 (Purpose)'),
  p(
    'These terms govern the conditions and procedures for using the online services provided by Forever Clinic Myeongdong (the "Clinic") through its website (the "Site"), including the rights, obligations, and responsibilities of the Clinic and users.',
  ),

  h3('Article 2 (Definitions)'),
  p('The following definitions apply to these terms:'),
  li(
    '"Site" refers to the internet website operated by the Clinic to provide services to users.',
  ),
  li(
    '"User" refers to members and non-members who access the site and receive services under these terms.',
  ),
  li(
    '"Member" refers to a person who has registered with the Clinic by providing personal information.',
  ),
  li(
    '"Non-member" refers to a person who uses services without registering as a member.',
  ),
  li(
    '"Appointment service" refers to the service for booking appointments in advance through the site.',
  ),
  li(
    '"Content" refers to all materials posted on the site, including text, images, videos, treatment information, and medical staff information.',
  ),

  h3('Article 3 (Effect and Modification of Terms)'),
  li(
    "These terms take effect upon posting on the site's main page or notification to users by other means.",
  ),
  li(
    'The Clinic may amend these terms as necessary, and amended terms take effect upon announcement on the site.',
  ),
  li(
    'Changes are announced at least 7 days before taking effect (30 days for significant changes to user rights and obligations).',
  ),
  li(
    'If users do not agree to the amended terms, they may discontinue use and withdraw membership. Failure to express objection within 7 days of the change notice is deemed consent to the amended terms.',
  ),

  h3('Article 4 (Services Provided)'),
  p('The Clinic provides the following services:'),
  li(
    'Appointment booking, confirmation, modification, and cancellation services',
  ),
  li('Medical staff introductions and treatment guidance information'),
  li(
    'Treatment and procedure information (dermatology, plastic surgery, aesthetics, etc.)',
  ),
  li('Events, announcements, and health information'),
  li('Online consultation inquiry reception'),
  li('Other services as determined by the Clinic'),

  h3('Article 5 (Service Use)'),
  li(
    'Service is available 24 hours a day, 365 days a year, unless there are special operational or technical difficulties.',
  ),
  li(
    'The Clinic may temporarily suspend service for equipment maintenance, natural disasters, national emergencies, or other force majeure events.',
  ),
  li(
    'Users will be notified in advance through site announcements when service is suspended.',
  ),

  h3('Article 6 (Membership Registration)'),
  li(
    'Users may register by completing the registration form established by the Clinic and agreeing to these terms.',
  ),
  p(
    'The Clinic may refuse or subsequently revoke membership in the following cases:',
  ),
  li('Previous loss of membership status'),
  li('False or misappropriated information provided'),
  li('Age under 14 without legal guardian consent'),
  li('Other violations of these terms or illegal/improper conduct'),

  h3('Article 7 (ID and Password Management)'),
  li(
    'Members are solely responsible for managing their ID and password and must not allow third parties to use them.',
  ),
  li(
    "Members must immediately notify the Clinic if their account is stolen or used by a third party, and must follow the Clinic's guidance.",
  ),
  li(
    "The Clinic is not liable for any disadvantage arising from failure to notify or failure to follow the Clinic's guidance after notification.",
  ),

  h3('Article 8 (User Obligations)'),
  p('Users must not engage in the following activities:'),
  li('Entering false information when registering or making changes'),
  li("Misappropriating another person's information"),
  li('Modifying information posted by the Clinic'),
  li('Infringing intellectual property rights of the Clinic or third parties'),
  li(
    'Defaming the Clinic or third parties, or interfering with their operations',
  ),
  li('Posting obscene or violent content on the site'),
  li("Using services for commercial purposes without the Clinic's consent"),
  li('Any other illegal or improper acts'),

  h3('Article 9 (Online Consultation and Appointment Services)'),
  li(
    'Online consultations and appointments do not replace actual medical treatment and have no medical diagnostic or therapeutic value.',
  ),
  li(
    'Appointments take effect upon confirmation and may be subject to change based on Clinic circumstances.',
  ),
  li(
    'To change or cancel an appointment, please contact the Clinic before the end of business hours on the day before your appointment. Repeated no-shows may result in service restrictions.',
  ),
  li(
    'Non-reimbursable treatment costs are announced in accordance with Article 45 of the Medical Service Act. Prices listed on the website may differ from actual costs; please confirm before visiting.',
  ),

  h3('Article 10 (Notice Regarding Treatment Information)'),
  p(
    'Treatment information for dermatology, plastic surgery, and aesthetics on this site has been prepared in accordance with the Medical Advertising Act (Article 56 of the Medical Service Act) and is intended for general informational purposes only.',
  ),
  li(
    'Treatment and procedure information on the site is for general informational purposes and does not constitute medical diagnosis or treatment.',
  ),
  li(
    'Results may vary by individual, and the content on the site may not apply equally to all patients.',
  ),
  li(
    'Before/after photos are posted with written patient consent and show results at least 3 months post-treatment.',
  ),
  li(
    'Detailed consultation and specific pricing for treatments must be determined through direct consultation with medical staff.',
  ),

  h3('Article 11 (Copyright and Intellectual Property)'),
  li(
    'Copyright and other intellectual property rights for content created by the Clinic belong to the Clinic.',
  ),
  li(
    "Users may not reproduce, transmit, publish, distribute, broadcast, or otherwise use information obtained from the site for commercial purposes without the Clinic's prior consent, nor may they allow third parties to do so.",
  ),

  h3('Article 12 (Disclaimer)'),
  li(
    'The Clinic is not liable for service disruptions caused by natural disasters, war, telecommunications service suspensions, or other force majeure events.',
  ),
  li(
    "The Clinic is not liable for service disruptions caused by the user's own actions.",
  ),
  li(
    'Medical information on the site is for reference only; the Clinic is not liable for any outcome based on independent medical decisions made by users.',
  ),

  h3('Article 13 (Dispute Resolution and Jurisdiction)'),
  li(
    'Disputes between the Clinic and users shall be resolved through mutual consultation as a first principle.',
  ),
  li(
    "The agreed jurisdiction for litigation regarding these terms is the court with jurisdiction over the Clinic's location.",
  ),
  li('Applicable law is the law of the Republic of Korea.'),

  h3('Article 14 (Miscellaneous)'),
  li(
    "Matters not specified in these terms are governed by applicable laws and the Clinic's detailed usage guidelines.",
  ),
  li(
    'If any provision of these terms is found invalid, the remaining provisions shall remain in full force and effect.',
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const doc = await sanityFetch<LegalDocument>(legalDocumentQuery, {
    documentType: 'terms-of-service',
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
  const heading = titles[locale] ?? titles.ko;

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
