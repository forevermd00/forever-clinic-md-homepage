// Run: node scripts/seed-legal.mjs
import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const client = createClient({
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-15',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

let _keyIdx = 0;
function k() {
  return `k${String(++_keyIdx).padStart(4, '0')}`;
}

function p(text) {
  return {
    _type: 'block', _key: k(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: [] }],
  };
}

function h3(text) {
  return {
    _type: 'block', _key: k(), style: 'h3', markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: [] }],
  };
}

function li(text) {
  return {
    _type: 'block', _key: k(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: [] }],
  };
}

function bold(text) {
  return {
    _type: 'block', _key: k(), style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: k(), text, marks: ['strong'] }],
  };
}

// ─── 개인정보처리방침 ─────────────────────────────────────

const privacyKo = [
  p('포에버 의원 명동점(이하 \'병원\')은 「개인정보 보호법」 제30조 및 「의료법」 제22조에 따라 정보주체의 개인정보를 보호하고 권익을 존중하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.'),

  h3('제1조 (개인정보의 처리 목적)'),
  p('병원은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.'),
  bold('1. 홈페이지 회원 가입·관리'),
  li('회원 가입 의사 확인, 회원 자격 유지·관리, 본인 식별·인증'),
  li('진료 예약 및 예약 확인, 변경, 취소 서비스 제공'),
  li('서비스 이용에 따른 불만처리, 분쟁 조정을 위한 기록 보존'),
  bold('2. 진료 및 의료 서비스 제공'),
  li('피부과·성형외과·에스테틱 등 진료 예약 및 진료 서비스 제공'),
  li('의료 상담, 시술·수술 안내 및 사전 동의'),
  li('진료비 결제 및 결제 내역 확인'),
  li('처방전 발행, 진단서 등 각종 증명서 발급'),
  bold('3. 마케팅 및 광고 활용 (별도 동의자에 한함)'),
  li('이벤트 및 프로모션 안내 문자·이메일·카카오톡 발송'),
  li('신규 시술 정보, 건강 정보 뉴스레터 제공'),
  li('서비스 개선을 위한 통계·분석 활용'),

  h3('제2조 (처리하는 개인정보 항목)'),
  p('병원은 다음의 개인정보 항목을 처리하고 있습니다.'),
  bold('1. 회원 가입 시 수집 항목'),
  li('[필수] 성명, 생년월일, 성별, 휴대전화번호, 이메일 주소, 로그인 ID, 비밀번호'),
  li('[선택] 주소, 직업, 유입 경로, 관심 시술 항목'),
  bold('2. 진료 예약 및 상담 시 수집 항목'),
  li('[필수] 성명, 연락처, 예약 희망 진료과목·시술명, 예약 일시'),
  li('[선택] 기존 시술 이력, 피부 타입, 특이사항, 상담 내용'),
  bold('3. 의료 서비스 이용 과정에서 자동 수집 항목'),
  li('IP 주소, 쿠키, 서비스 이용기록, 방문기록, 불량 이용기록'),
  bold('4. 민감정보 (의료법 및 개인정보 보호법 제23조에 따라 수집)'),
  li('진료 과정에서 수집되는 건강정보, 진료기록, 처방 내역'),
  li('시술·수술 전후 사진 (환자 서면 동의 후 수집)'),
  p('민감정보는 의료법 제22조, 동법 시행규칙 제14조, 개인정보 보호법 제23조 제2항 제2호에 따라 법령에 근거하여 수집합니다.'),

  h3('제3조 (개인정보의 처리 및 보유 기간)'),
  li('병원은 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.'),
  li('각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.'),
  bold('■ 회원 정보: 회원 탈퇴 시까지 (단, 부정 이용 방지를 위해 탈퇴 후 1년간 보관)'),
  bold('■ 진료 기록: 의료법 시행규칙 제15조에 따라 최소 5년 (일부 기록은 10년)'),
  bold('■ 예약 및 상담 기록: 3년'),
  bold('■ 마케팅 수신 동의 철회 시: 즉시 파기 (단, 철회 이력은 1년 보관)'),
  bold('■ 전자상거래 거래 기록: 전자상거래법에 따라 5년'),
  bold('■ 소비자 불만·분쟁 처리 기록: 전자상거래법에 따라 3년'),

  h3('제4조 (개인정보의 제3자 제공)'),
  li('병원은 정보주체의 개인정보를 제1조(처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.'),
  li('다음의 경우 정보주체 동의 없이 제3자에게 제공할 수 있습니다.'),
  li('「의료법」 제21조에 따른 타 의료기관으로의 진료기록 송부'),
  li('「국민건강보험법」에 따른 건강보험심사평가원, 국민건강보험공단에 대한 제공'),
  li('법령에 따른 수사기관의 요청이 있는 경우'),

  h3('제5조 (개인정보 처리 위탁)'),
  li('병원은 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 외부에 위탁하고 있습니다.'),
  bold('위탁업체 및 업무 내용'),
  li('수탁업체: SMS·카카오 알림 발송업체 / 위탁업무: 예약 확인 문자 및 알림 발송'),
  li('수탁업체: 홈페이지 운영·관리업체 / 위탁업무: 홈페이지 유지보수 및 서버 운영'),
  li('수탁업체: 결제대행업체 / 위탁업무: 진료비 온라인 결제 처리'),
  li('병원은 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행 목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한 등을 계약서에 명시하고 있습니다.'),

  h3('제6조 (정보주체의 권리·의무 및 행사 방법)'),
  li('정보주체는 병원에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.'),
  li('개인정보 열람 요구'),
  li('오류 등이 있을 경우 정정 요구'),
  li('삭제 요구'),
  li('처리정지 요구'),
  li('제1항에 따른 권리 행사는 병원에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편, 팩스 등을 통해 하실 수 있으며, 병원은 이에 대해 지체 없이 조치하겠습니다.'),
  li('진료기록 열람의 경우, 「의료법」 제21조 및 동법 시행규칙 제13조의3에 따라 별도의 신분 확인 절차가 필요합니다.'),
  li('만 14세 미만 아동의 개인정보 처리는 법정대리인의 동의를 받아 처리하며, 법정대리인은 해당 아동의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다.'),

  h3('제7조 (개인정보의 파기)'),
  li('병원은 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.'),
  li('정보주체로부터 동의받은 개인정보 보유 기간이 경과하거나 처리 목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관 장소를 달리하여 보존합니다.'),
  li('개인정보 파기의 절차 및 방법은 다음과 같습니다.'),
  li('파기 절차: 파기 사유 발생 → 개인정보보호책임자 승인 → 파기 실행 → 파기 완료 기록'),
  li('파기 방법(전자): 복원이 불가능한 방법으로 영구 삭제'),
  li('파기 방법(출력물): 분쇄기로 분쇄하거나 소각'),

  h3('제8조 (개인정보의 안전성 확보 조치)'),
  p('병원은 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적 및 물리적 조치를 하고 있습니다.'),
  li('내부관리계획 수립 및 시행'),
  li('개인정보 취급 직원의 최소화 및 교육'),
  li('개인정보에 대한 접근 제한 (접근통제시스템 운영)'),
  li('개인정보를 저장·전송하는 경우 암호화 적용'),
  li('해킹 등에 대비한 기술적 대책 (백신 프로그램, 방화벽 등)'),
  li('개인정보 처리시스템 접속기록 보관 및 위·변조 방지'),
  li('진료 공간 등 물리적 접근 통제'),

  h3('제9조 (쿠키의 운영 및 거부)'),
  li('병원은 이용자에게 맞춤형 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 \'쿠키(Cookie)\'를 사용합니다.'),
  li('쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 소량의 정보이며, 이용자의 컴퓨터에 저장됩니다.'),
  li('이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹 브라우저의 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다. 단, 쿠키 설치를 거부하는 경우 일부 서비스 이용이 제한될 수 있습니다.'),

  h3('제10조 (개인정보보호책임자)'),
  p('병원은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.'),
  bold('■ 개인정보보호책임자'),
  li('성명: [성명]'),
  li('직책: [원장 / 원무과장 등]'),
  li('연락처: [전화번호] / [이메일]'),
  bold('■ 개인정보보호 담당부서'),
  li('부서명: [원무과 / 행정팀 등]'),
  li('연락처: [전화번호] / [이메일]'),
  p('정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래 부서에 하실 수 있습니다. 병원은 정보주체의 열람청구가 신속하게 처리되도록 노력하겠습니다.'),

  h3('제11조 (권익침해 구제방법)'),
  p('정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다.'),
  li('개인정보 침해신고센터 (한국인터넷진흥원 운영): privacy.kisa.or.kr / 국번 없이 118'),
  li('개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972'),
  li('대검찰청 사이버범죄수사단: www.spo.go.kr / 1301'),
  li('경찰청 사이버안전국: cyberbureau.police.go.kr / 국번 없이 182'),

  h3('제12조 (개인정보처리방침의 변경)'),
  li('이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가·삭제·정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지합니다.'),
  li('단, 정보주체의 권리에 중요한 변경이 있는 경우에는 최소 30일 전에 공지합니다.'),
];

// ─── 개인정보처리방침 영어 ────────────────────────────────────

const privacyEn = [
  p('Forever Clinic Myeongdong (hereinafter "Clinic") processes personal information in accordance with Article 30 of the Personal Information Protection Act and Article 22 of the Medical Service Act to protect the rights and interests of data subjects.'),

  h3('Article 1 (Purpose of Processing Personal Information)'),
  p('The Clinic processes personal information for the following purposes. Personal information will not be used for purposes other than those stated below. If the purpose changes, the Clinic will take necessary measures such as obtaining separate consent in accordance with Article 18 of the Personal Information Protection Act.'),
  bold('1. Website membership registration and management'),
  li('Confirming intent to register, maintaining membership status, identity verification'),
  li('Providing appointment booking, confirmation, modification, and cancellation services'),
  li('Maintaining records for complaints and dispute resolution'),
  bold('2. Medical and healthcare services'),
  li('Appointment booking and medical services for dermatology, plastic surgery, aesthetics, etc.'),
  li('Medical consultation, procedure guidance, and prior consent'),
  li('Processing and confirming medical fee payments'),
  li('Issuing prescriptions, medical certificates, and other documents'),
  bold('3. Marketing and advertising (only for those who provide separate consent)'),
  li('Sending event and promotion notifications via SMS, email, and KakaoTalk'),
  li('Providing new treatment information and health newsletters'),
  li('Statistical and analytical use for service improvement'),

  h3('Article 2 (Personal Information Items Processed)'),
  p('The Clinic processes the following personal information:'),
  bold('1. Items collected upon membership registration'),
  li('[Required] Name, date of birth, gender, mobile phone number, email address, login ID, password'),
  li('[Optional] Address, occupation, referral source, treatment interests'),
  bold('2. Items collected for appointments and consultations'),
  li('[Required] Name, contact information, desired treatment, appointment date and time'),
  li('[Optional] Previous treatment history, skin type, special notes, consultation content'),
  bold('3. Items automatically collected during service use'),
  li('IP address, cookies, service usage records, visit records, improper use records'),
  bold('4. Sensitive information (collected pursuant to the Medical Service Act and Article 23 of the Personal Information Protection Act)'),
  li('Health information, medical records, and prescription details collected during treatment'),
  li('Before/after procedure photos (collected after written patient consent)'),
  p('Sensitive information is collected pursuant to Article 22 of the Medical Service Act, Article 14 of its Enforcement Rules, and Article 23(2)(2) of the Personal Information Protection Act.'),

  h3('Article 3 (Retention Period)'),
  li('The Clinic processes and retains personal information within the legally required retention period or the period agreed upon when collecting personal information from data subjects.'),
  li('Retention periods for each category of personal information are as follows:'),
  bold('■ Member information: Until withdrawal (retained 1 year post-withdrawal to prevent misuse)'),
  bold('■ Medical records: At least 5 years per the Medical Service Act Enforcement Rules Article 15 (some records 10 years)'),
  bold('■ Reservation and consultation records: 3 years'),
  bold('■ Upon withdrawal of marketing consent: Immediately destroyed (withdrawal history retained 1 year)'),
  bold('■ E-commerce transaction records: 5 years per the E-Commerce Act'),
  bold('■ Consumer complaint/dispute records: 3 years per the E-Commerce Act'),

  h3('Article 4 (Third-Party Disclosure)'),
  li('The Clinic processes personal information only within the scope stated in Article 1 and provides personal information to third parties only with the user\'s consent or as required by law (Articles 17 and 18 of the Personal Information Protection Act).'),
  li('Personal information may be provided to third parties without consent in the following cases:'),
  li('Transfer of medical records to other medical institutions per Article 21 of the Medical Service Act'),
  li('Provision to the Health Insurance Review and Assessment Service and National Health Insurance Service per the National Health Insurance Act'),
  li('Requests from investigative agencies pursuant to applicable law'),

  h3('Article 5 (Processing Consignment)'),
  li('The Clinic entrusts personal information processing to the following third parties for smooth service delivery:'),
  bold('Consignment Details'),
  li('Consignee: SMS/KakaoTalk notification service / Work: Appointment confirmation messages and alerts'),
  li('Consignee: Website operation and management service / Work: Website maintenance and server operation'),
  li('Consignee: Payment processing service / Work: Online medical fee payment processing'),
  li('When entering into entrustment agreements, the Clinic specifies in contracts: prohibition of processing personal information beyond the scope of entrusted work, technical and managerial protective measures, and restrictions on re-entrustment, in accordance with Article 26 of the Personal Information Protection Act.'),

  h3('Article 6 (Rights of the Data Subject)'),
  li('The data subject may exercise the following rights against the Clinic at any time:'),
  li('Right to access personal information'),
  li('Right to request correction of errors'),
  li('Right to request deletion'),
  li('Right to request suspension of processing'),
  li('Rights may be exercised in writing, by email, or by fax pursuant to Article 41(1) of the Personal Information Protection Act Enforcement Decree, and the Clinic will respond without delay.'),
  li('For access to medical records, separate identity verification is required under Article 21 of the Medical Service Act and Article 13-3 of its Enforcement Rules.'),
  li('Personal information of children under 14 is processed with the consent of their legal guardian, who may request access, correction, deletion, or suspension of processing.'),

  h3('Article 7 (Destruction of Personal Information)'),
  li('The Clinic destroys personal information without delay once the purpose of processing has been fulfilled.'),
  li('If personal information must be retained despite the expiration of the agreed retention period or fulfillment of the processing purpose due to other legal requirements, the information is moved to a separate database or stored in a different location.'),
  li('Destruction procedure and methods:'),
  li('Destruction procedure: Grounds arise → Privacy Officer approval → Destruction executed → Destruction record kept'),
  li('Electronic files: Permanently deleted using irreversible methods'),
  li('Printed materials: Shredded or incinerated'),

  h3('Article 8 (Security Measures)'),
  p('The Clinic implements the following technical, administrative, and physical measures in accordance with Article 29 of the Personal Information Protection Act:'),
  li('Establishment and implementation of internal management plans'),
  li('Minimizing personnel handling personal information and conducting training'),
  li('Restricting access to personal information (access control systems)'),
  li('Applying encryption when storing or transmitting personal information'),
  li('Technical countermeasures against hacking (antivirus programs, firewalls, etc.)'),
  li('Maintaining and protecting access records to personal information processing systems'),
  li('Physical access control to medical spaces and facilities'),

  h3('Article 9 (Cookies)'),
  li('The Clinic uses cookies to store and retrieve usage information to provide personalized services.'),
  li('Cookies are small pieces of information sent by the server to the user\'s browser and stored on the user\'s computer.'),
  li('Users may accept or refuse cookies through browser settings. Refusing cookies may limit certain services.'),

  h3('Article 10 (Privacy Officer)'),
  p('The Clinic has designated a Privacy Officer responsible for overseeing personal information processing and handling complaints and remedies.'),
  bold('■ Privacy Officer'),
  li('Name: [Name]'),
  li('Position: [Director / Administrative Manager, etc.]'),
  li('Contact: [Phone number] / [Email]'),
  bold('■ Privacy Department'),
  li('Department: [Administrative Office / Admin Team, etc.]'),
  li('Contact: [Phone number] / [Email]'),
  p('Data subjects may submit personal information access requests pursuant to Article 35 of the Personal Information Protection Act to the department above. The Clinic will ensure timely processing of access requests.'),

  h3('Article 11 (Remedies for Rights Violations)'),
  p('For personal information violation remedies and consultations, you may contact the following agencies:'),
  li('Personal Information Infringement Report Center (KISA): privacy.kisa.or.kr / 118'),
  li('Personal Information Dispute Mediation Committee: www.kopico.go.kr / 1833-6972'),
  li('Supreme Prosecutors\' Office Cyber Crime Investigation Division: www.spo.go.kr / 1301'),
  li('National Police Agency Cyber Safety Bureau: cyberbureau.police.go.kr / 182'),

  h3('Article 12 (Changes to This Policy)'),
  li('This Privacy Policy takes effect from the effective date. Changes due to laws or policy will be announced through notices at least 7 days before taking effect.'),
  li('For significant changes to user rights, notice will be given at least 30 days in advance.'),
];

// ─── 이용약관 ─────────────────────────────────────────────

const termsKo = [
  p('본 이용약관은 포에버 의원 명동점(이하 \'병원\')이 운영하는 홈페이지(이하 \'사이트\') 이용에 관한 조건 및 절차, 병원과 이용자의 권리·의무 및 책임사항을 규정합니다.'),

  h3('제1조 (목적)'),
  p('이 약관은 포에버 의원 명동점(이하 \'병원\'이라 합니다)이 운영하는 인터넷 홈페이지(이하 \'사이트\'라 합니다)에서 제공하는 온라인 서비스의 이용과 관련하여 병원과 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.'),

  h3('제2조 (정의)'),
  p('이 약관에서 사용하는 용어의 정의는 다음과 같습니다.'),
  li('\'사이트\'란 병원이 서비스를 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 운영하는 인터넷 홈페이지를 의미합니다.'),
  li('\'이용자\'란 사이트에 접속하여 이 약관에 따라 병원이 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.'),
  li('\'회원\'이란 병원에 개인정보를 제공하고 회원등록을 한 자로서, 사이트의 정보를 지속적으로 제공받으며 병원이 제공하는 서비스를 이용할 수 있는 자를 의미합니다.'),
  li('\'비회원\'이란 회원에 가입하지 않고 병원이 제공하는 서비스를 이용하는 자를 의미합니다.'),
  li('\'진료 예약 서비스\'란 사이트를 통해 진료 일정을 사전에 예약하는 서비스를 의미합니다.'),
  li('\'콘텐츠\'란 사이트에 게시된 텍스트, 이미지, 영상, 시술·수술 정보, 의료진 정보 등 모든 자료를 의미합니다.'),

  h3('제3조 (약관의 효력 및 변경)'),
  li('이 약관은 사이트 초기화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.'),
  li('병원은 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지함으로써 효력이 발생합니다.'),
  li('약관이 변경되는 경우 변경 시행 7일 전부터 사이트 공지사항을 통해 공지합니다. 단, 이용자의 권리·의무에 중대한 변경이 있는 경우에는 30일 전에 공지합니다.'),
  li('이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 변경 공지 후 7일 이내에 거부 의사를 명시하지 않으면 변경 약관에 동의한 것으로 간주합니다.'),

  h3('제4조 (서비스의 내용)'),
  p('병원은 다음의 서비스를 제공합니다.'),
  li('진료 예약 및 예약 확인·변경·취소 서비스'),
  li('의료진 소개 및 진료 안내 정보 제공'),
  li('시술·수술 정보(피부과, 성형외과, 에스테틱 등) 제공'),
  li('이벤트, 공지사항 및 건강 정보 제공'),
  li('온라인 상담 문의 접수'),
  li('기타 병원이 정하는 서비스'),

  h3('제5조 (서비스 이용)'),
  li('서비스 이용시간은 병원의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.'),
  li('병원은 다음 각 호의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.'),
  li('컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장·통신두절의 경우'),
  li('전기통신사업법에 규정된 기간통신사업자가 전기통신서비스를 중지한 경우'),
  li('천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우'),
  li('서비스 이용 중단 시 병원은 사전에 사이트 공지사항을 통해 통지합니다. 단, 예측하기 어려운 이유로 사전 통지가 불가능한 경우 사후 통지합니다.'),

  h3('제6조 (회원 가입)'),
  li('이용자는 병원이 정한 가입 양식에 따라 정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원 가입을 신청합니다.'),
  li('병원은 다음 각 호의 사유가 있는 경우 회원 가입을 거부하거나 사후에 회원 자격을 취소할 수 있습니다.'),
  li('가입 신청자가 이전에 회원 자격을 상실한 적이 있는 경우'),
  li('허위 또는 타인의 정보를 기재한 경우'),
  li('만 14세 미만인 경우 (법정 대리인의 동의 없이 가입 신청한 경우)'),
  li('기타 이 약관에 위배되거나 위법·부당한 행위를 하는 경우'),

  h3('제7조 (회원의 아이디 및 비밀번호 관리)'),
  li('회원의 아이디와 비밀번호에 관한 관리 책임은 회원에게 있으며, 이를 제3자가 이용하도록 해서는 안 됩니다.'),
  li('회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우 즉시 병원에 통보하고 병원의 안내에 따라야 합니다.'),
  li('전항의 경우 병원에 통보하지 않거나 통보한 경우에도 병원의 안내에 따르지 않아 발생한 불이익에 대하여는 병원은 책임지지 않습니다.'),

  h3('제8조 (이용자의 의무)'),
  p('이용자는 다음 각 호의 행위를 하여서는 안 됩니다.'),
  li('신청 또는 변경 시 허위 내용의 등록'),
  li('타인의 정보 도용'),
  li('병원이 게시한 정보의 변경'),
  li('병원이 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시'),
  li('병원 및 기타 제3자의 저작권 등 지식재산권에 대한 침해'),
  li('병원 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위'),
  li('음란하거나 폭력적인 메시지·영상·음성 및 기타 공서양속에 반하는 정보를 사이트에 공개 또는 게시하는 행위'),
  li('병원의 동의 없이 영리를 목적으로 서비스를 사용하는 행위'),
  li('기타 불법적이거나 부당한 행위'),

  h3('제9조 (온라인 상담 및 예약 서비스 이용 안내)'),
  li('온라인 상담 및 예약 서비스는 실제 진료를 대체하지 않으며, 의학적 진단이나 치료의 의미를 갖지 않습니다.'),
  li('진료 예약은 예약 확정 시점부터 효력이 발생하며, 병원의 사정에 따라 예약이 변경될 수 있습니다.'),
  li('예약 변경 또는 취소를 원하는 경우, 예약일 전날 진료시간 종료 전까지 병원에 연락하여 주시기 바랍니다. 무단 예약 불이행이 반복되는 경우 서비스 이용이 제한될 수 있습니다.'),
  li('비급여 진료비용은 의료법 제45조에 따라 병원 내 원내 고지를 통해 안내하며, 홈페이지 게시 정보와 실제 비용이 차이가 있을 수 있으므로 내원 전 반드시 확인하시기 바랍니다.'),

  h3('제10조 (시술·수술 정보 콘텐츠 관련 고지)'),
  bold('본 사이트에 게재된 피부과·성형외과·에스테틱 시술 정보는 의료광고법(의료법 제56조)에 따라 작성되었으며, 일반적인 정보 제공 목적으로만 활용됩니다.'),
  li('사이트에 게재된 시술·수술 정보는 일반적인 정보 제공 목적이며, 의학적 진단·치료 행위가 아닙니다.'),
  li('시술·수술의 효과는 개인에 따라 다를 수 있으며, 사이트에 기재된 내용이 모든 환자에게 동일하게 적용되지 않습니다.'),
  li('병원은 의료법 제56조에 따라 과장·허위 광고를 금지하며, 부작용이 있을 수 있는 시술의 경우 해당 정보를 함께 고지합니다.'),
  li('시술 전후 사진이 게시된 경우, 해당 환자의 서면 동의를 받은 자료이며 시술 후 3개월 이상 경과된 결과물입니다.'),
  li('시술 관련 상세 상담 및 구체적인 견적은 반드시 의료진과 직접 상담을 통해 결정하여야 합니다.'),

  h3('제11조 (저작권 및 지식재산권)'),
  li('병원이 작성한 저작물에 대한 저작권 및 기타 지식재산권은 병원에 귀속됩니다.'),
  li('이용자는 사이트를 이용함으로써 얻은 정보를 병원의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송, 기타 방법으로 영리 목적으로 이용하거나 제3자에게 이용하게 해서는 안 됩니다.'),
  li('병원은 약정에 따라 이용자에게 귀속된 저작권을 사용하는 경우 당해 이용자에게 통보합니다.'),

  h3('제12조 (면책 조항)'),
  li('병원은 천재지변, 전쟁, 기간통신사업자의 서비스 중지 및 기타 불가항력적인 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.'),
  li('병원은 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.'),
  li('사이트에 게재된 의료 정보는 참고용이며, 이를 근거로 한 이용자의 독자적인 의료 판단으로 인한 결과에 대해 병원은 책임을 지지 않습니다.'),
  li('이용자가 사이트에 게재한 정보·자료·사실 등의 신뢰도 및 정확성에 대한 책임은 이용자에게 있습니다.'),

  h3('제13조 (분쟁 해결 및 관할 법원)'),
  li('병원과 이용자 간에 발생한 분쟁은 상호 협의하여 해결함을 원칙으로 합니다.'),
  li('이 약관에 관한 소송의 합의 관할 법원은 병원 소재지를 관할하는 법원으로 합니다.'),
  li('이 약관과 관련하여 적용되는 법령은 대한민국 법령으로 합니다.'),

  h3('제14조 (기타)'),
  li('이 약관에 명시되지 않은 사항은 관련 법령 및 병원이 정한 세부 이용지침 등의 규정에 따릅니다.'),
  li('이 약관의 일부가 무효인 경우에도 나머지 조항은 유효하게 존속합니다.'),
];

// ─── 이용약관 영어 ────────────────────────────────────────

const termsEn = [
  p('These terms govern the conditions and procedures for using the online services provided by Forever Clinic Myeongdong (the "Clinic") through its website (the "Site"), including the rights, obligations, and responsibilities of the Clinic and users.'),

  h3('Article 1 (Purpose)'),
  p('These terms govern the use of online services provided by Forever Clinic Myeongdong (the "Clinic") through its website (the "Site"), including the rights, obligations, responsibilities, and other necessary matters between the Clinic and users.'),

  h3('Article 2 (Definitions)'),
  p('The following definitions apply to these terms:'),
  li('"Site" refers to the internet website operated by the Clinic using information and communications equipment to provide services to users.'),
  li('"User" refers to members and non-members who access the site and receive services from the Clinic under these terms.'),
  li('"Member" refers to a person who has registered with the Clinic by providing personal information and can continuously receive information and use services provided by the Clinic.'),
  li('"Non-member" refers to a person who uses services provided by the Clinic without registering as a member.'),
  li('"Appointment service" refers to the service for booking appointments in advance through the site.'),
  li('"Content" refers to all materials posted on the site, including text, images, videos, treatment information, and medical staff information.'),

  h3('Article 3 (Effect and Modification of Terms)'),
  li('These terms take effect upon posting on the site\'s main page or notification to users by other means.'),
  li('The Clinic may amend these terms as necessary, and amended terms take effect upon announcement on the site.'),
  li('Changes are announced at least 7 days before taking effect (30 days for significant changes to user rights and obligations).'),
  li('If users do not agree to the amended terms, they may discontinue use and withdraw membership. Failure to express objection within 7 days of the change notice is deemed consent to the amended terms.'),

  h3('Article 4 (Services Provided)'),
  p('The Clinic provides the following services:'),
  li('Appointment booking, confirmation, modification, and cancellation services'),
  li('Medical staff introductions and treatment guidance information'),
  li('Treatment and procedure information (dermatology, plastic surgery, aesthetics, etc.)'),
  li('Events, announcements, and health information'),
  li('Online consultation inquiry reception'),
  li('Other services as determined by the Clinic'),

  h3('Article 5 (Service Use)'),
  li('Service is available 24 hours a day, 365 days a year, unless there are special operational or technical difficulties.'),
  li('The Clinic may temporarily suspend service in the following cases:'),
  li('Equipment maintenance, replacement, failure, or communication disruption'),
  li('Suspension of telecommunications services by a carrier regulated under the Telecommunications Business Act'),
  li('Force majeure events such as natural disasters or national emergencies'),
  li('Users will be notified in advance through site announcements when service is suspended. If advance notice is not possible due to unforeseeable circumstances, notice will be given after the fact.'),

  h3('Article 6 (Membership Registration)'),
  li('Users may register by completing the registration form established by the Clinic and expressing agreement to these terms.'),
  li('The Clinic may refuse or subsequently revoke membership in the following cases:'),
  li('Previous loss of membership status'),
  li('False or misappropriated information provided'),
  li('Age under 14 without legal guardian consent'),
  li('Other violations of these terms or illegal/improper conduct'),

  h3('Article 7 (ID and Password Management)'),
  li('Members are solely responsible for managing their ID and password and must not allow third parties to use them.'),
  li('Members must immediately notify the Clinic if their account is stolen or used by a third party, and must follow the Clinic\'s guidance.'),
  li('The Clinic is not liable for any disadvantage arising from failure to notify or failure to follow the Clinic\'s guidance after notification.'),

  h3('Article 8 (User Obligations)'),
  p('Users must not engage in the following activities:'),
  li('Entering false information when registering or making changes'),
  li('Misappropriating another person\'s information'),
  li('Modifying information posted by the Clinic'),
  li('Transmitting or posting information other than that designated by the Clinic (including computer programs)'),
  li('Infringing intellectual property rights of the Clinic or third parties'),
  li('Defaming the Clinic or third parties, or interfering with their operations'),
  li('Posting obscene or violent messages, videos, audio, or other content contrary to public order and morals'),
  li('Using services for commercial purposes without the Clinic\'s consent'),
  li('Any other illegal or improper acts'),

  h3('Article 9 (Online Consultation and Appointment Services)'),
  li('Online consultations and appointments do not replace actual medical treatment and have no medical diagnostic or therapeutic value.'),
  li('Appointments take effect upon confirmation and may be subject to change based on Clinic circumstances.'),
  li('To change or cancel an appointment, please contact the Clinic before the end of business hours on the day before your appointment. Repeated no-shows may result in service restrictions.'),
  li('Non-reimbursable treatment costs are announced in accordance with Article 45 of the Medical Service Act. Prices listed on the website may differ from actual costs; please confirm before visiting.'),

  h3('Article 10 (Notice Regarding Treatment Information)'),
  bold('Treatment information for dermatology, plastic surgery, and aesthetics on this site has been prepared in accordance with the Medical Advertising Act (Article 56 of the Medical Service Act) and is intended for general informational purposes only.'),
  li('Treatment and procedure information on the site is for general informational purposes and does not constitute medical diagnosis or treatment.'),
  li('Results may vary by individual, and the content on the site may not apply equally to all patients.'),
  li('The Clinic prohibits exaggerated or false advertising per Article 56 of the Medical Service Act and discloses potential side effects for applicable procedures.'),
  li('Before/after photos are posted with written patient consent and show results at least 3 months post-treatment.'),
  li('Detailed consultation and specific pricing for treatments must be determined through direct consultation with medical staff.'),

  h3('Article 11 (Copyright and Intellectual Property)'),
  li('Copyright and other intellectual property rights for content created by the Clinic belong to the Clinic.'),
  li('Users may not reproduce, transmit, publish, distribute, broadcast, or otherwise use information obtained from the site for commercial purposes without the Clinic\'s prior consent, nor may they allow third parties to do so.'),
  li('The Clinic will notify the relevant user when using copyrights that belong to the user pursuant to an agreement.'),

  h3('Article 12 (Disclaimer)'),
  li('The Clinic is not liable for service disruptions caused by natural disasters, war, telecommunications service suspensions, or other force majeure events.'),
  li('The Clinic is not liable for service disruptions caused by the user\'s own actions.'),
  li('Medical information on the site is for reference only; the Clinic is not liable for any outcome based on independent medical decisions made by users.'),
  li('The user is responsible for the reliability and accuracy of information, data, and facts posted by the user on the site.'),

  h3('Article 13 (Dispute Resolution and Jurisdiction)'),
  li('Disputes between the Clinic and users shall be resolved through mutual consultation as a first principle.'),
  li('The agreed jurisdiction for litigation regarding these terms is the court with jurisdiction over the Clinic\'s location.'),
  li('Applicable law is the law of the Republic of Korea.'),

  h3('Article 14 (Miscellaneous)'),
  li('Matters not specified in these terms are governed by applicable laws and the Clinic\'s detailed usage guidelines.'),
  li('If any provision of these terms is found invalid, the remaining provisions shall remain in full force and effect.'),
];

// ─── Sanity 저장 ──────────────────────────────────────────

async function seed() {
  console.log('Seeding legal documents...');

  await client
    .createOrReplace({
      _id: 'legal-privacy-policy',
      _type: 'legalDocument',
      documentType: 'privacy-policy',
      effectiveDate: '2025-04-23',
      publicationDate: '2025-04-23',
      contentKo: privacyKo,
      contentEn: privacyEn,
      contentZh: privacyEn,
      contentJa: privacyEn,
    });
  console.log('✓ 개인정보처리방침 저장 완료');

  await client
    .createOrReplace({
      _id: 'legal-terms-of-service',
      _type: 'legalDocument',
      documentType: 'terms-of-service',
      effectiveDate: '2025-04-23',
      publicationDate: '2025-04-23',
      contentKo: termsKo,
      contentEn: termsEn,
      contentZh: termsEn,
      contentJa: termsEn,
    });
  console.log('✓ 이용약관 저장 완료');

  console.log('Done!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
