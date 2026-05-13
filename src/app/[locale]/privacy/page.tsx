import type { Metadata } from 'next';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

const titles: Record<string, string> = {
  ko: '개인정보 처리방침',
  en: 'Privacy Policy',
  zh: '隐私政策',
  ja: 'プライバシーポリシー',
};

const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 개인정보 처리방침.',
  en: 'Privacy policy for Forever Clinic Myeongdong.',
  zh: '永恒诊所明洞隐私政策。',
  ja: 'フォーエバークリニック明洞のプライバシーポリシー。',
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

const CONTENT: Record<
  string,
  { heading: string; sections: { title: string; body: string }[] }
> = {
  ko: {
    heading: '개인정보 처리방침',
    sections: [
      {
        title: '제1조 (수집하는 개인정보 항목)',
        body: '포에버 클리닉 명동(이하 "클리닉")은 상담 신청 접수를 위해 다음의 개인정보를 수집합니다.\n\n필수 항목: 성명, 연락처',
      },
      {
        title: '제2조 (개인정보의 수집 및 이용 목적)',
        body: '클리닉은 수집한 개인정보를 다음의 목적으로 이용합니다.\n\n· 상담 신청 접수 및 예약 확인 연락\n· 서비스 이용에 따른 본인 식별',
      },
      {
        title: '제3조 (개인정보의 보유 및 이용 기간)',
        body: '클리닉은 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.\n\n· 보유 기간: 상담 종료 후 1년\n· 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보존합니다.',
      },
      {
        title: '제4조 (개인정보의 제3자 제공)',
        body: '클리닉은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 사전 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.',
      },
      {
        title: '제5조 (동의 거부 권리)',
        body: '귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부하실 경우 상담 서비스 이용이 제한될 수 있습니다.',
      },
      {
        title: '제6조 (개인정보 처리 담당자)',
        body: '개인정보 관련 문의는 클리닉 대표 연락처로 연락해 주시기 바랍니다.',
      },
    ],
  },
  en: {
    heading: 'Privacy Policy',
    sections: [
      {
        title: 'Article 1 (Personal Information Collected)',
        body: 'Forever Clinic Myeongdong (hereinafter "Clinic") collects the following personal information for consultation requests.\n\nRequired: Name, phone number',
      },
      {
        title: 'Article 2 (Purpose of Collection and Use)',
        body: 'The Clinic uses collected personal information for the following purposes.\n\n· Processing consultation requests and confirming reservations\n· User identification for service use',
      },
      {
        title: 'Article 3 (Retention Period)',
        body: 'The Clinic destroys personal information without delay after the purpose of collection has been fulfilled.\n\n· Retention period: 1 year after consultation\n· Exception: information may be retained longer if required by applicable law.',
      },
      {
        title: 'Article 4 (Third-Party Disclosure)',
        body: 'As a rule, the Clinic does not provide personal information to third parties. Exceptions apply when the user has given prior consent or when required by law.',
      },
      {
        title: 'Article 5 (Right to Refuse)',
        body: 'You have the right to refuse consent to the collection and use of your personal information. However, refusal may limit your ability to use consultation services.',
      },
      {
        title: 'Article 6 (Contact)',
        body: 'For inquiries regarding personal information, please contact the Clinic directly.',
      },
    ],
  },
  zh: {
    heading: '隐私政策',
    sections: [
      {
        title: '第1条（收集的个人信息项目）',
        body: '永恒诊所明洞（以下简称"诊所"）为受理咨询申请，收集以下个人信息。\n\n必填项：姓名、联系方式',
      },
      {
        title: '第2条（个人信息的收集及使用目的）',
        body: '诊所将收集的个人信息用于以下目的。\n\n· 受理咨询申请及预约确认联系\n· 使用服务时的本人确认',
      },
      {
        title: '第3条（个人信息的保留及使用期限）',
        body: '个人信息收集及使用目的达成后，诊所将立即销毁相关信息。\n\n· 保留期限：咨询结束后1年\n· 若法律法规有特别规定，则按相关规定期限保留。',
      },
      {
        title: '第4条（向第三方提供）',
        body: '原则上，诊所不向外部提供用户的个人信息。但事先获得用户同意或法律法规有规定的情况除外。',
      },
      {
        title: '第5条（拒绝同意的权利）',
        body: '您有权拒绝同意收集及使用个人信息。但拒绝后可能无法使用咨询服务。',
      },
      {
        title: '第6条（个人信息负责人）',
        body: '如有个人信息相关疑问，请通过诊所代表联系方式与我们联系。',
      },
    ],
  },
  ja: {
    heading: 'プライバシーポリシー',
    sections: [
      {
        title: '第1条（収集する個人情報の項目）',
        body: 'フォーエバークリニック明洞（以下「クリニック」）は、相談申込の受付のために以下の個人情報を収集します。\n\n必須項目：氏名、連絡先',
      },
      {
        title: '第2条（個人情報の収集・利用目的）',
        body: 'クリニックは収集した個人情報を以下の目的で利用します。\n\n· 相談申込の受付および予約確認連絡\n· サービス利用時の本人確認',
      },
      {
        title: '第3条（個人情報の保管期間）',
        body: '収集・利用の目的が達成された後、クリニックは個人情報を速やかに削除します。\n\n· 保管期間：相談終了後1年間\n· ただし、法令の規定により保存が必要な場合は、当該期間保存します。',
      },
      {
        title: '第4条（第三者への提供）',
        body: '原則として、クリニックは利用者の個人情報を外部に提供しません。ただし、利用者の事前同意がある場合または法令の規定による場合は例外です。',
      },
      {
        title: '第5条（同意拒否の権利）',
        body: '個人情報の収集・利用への同意を拒否する権利があります。ただし、拒否した場合、相談サービスの利用が制限される場合があります。',
      },
      {
        title: '第6条（個人情報担当者）',
        body: '個人情報に関するお問い合わせは、クリニック代表の連絡先にご連絡ください。',
      },
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = CONTENT[locale] ?? CONTENT.ko;

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[720px]">
        <h1 className="mb-10 text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
          {content.heading}
        </h1>
        <div className="flex flex-col gap-8">
          {content.sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 text-[15px] font-semibold text-[#2b2b2b]">
                {section.title}
              </h2>
              <p className="text-[14px] leading-[1.8] whitespace-pre-line text-[#555]">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
