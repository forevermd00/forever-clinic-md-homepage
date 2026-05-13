import type { Metadata } from 'next';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

const titles: Record<string, string> = {
  ko: '이용약관',
  en: 'Terms of Service',
  zh: '服务条款',
  ja: '利用規約',
};

const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 이용약관.',
  en: 'Terms of service for Forever Clinic Myeongdong.',
  zh: '永恒诊所明洞服务条款。',
  ja: 'フォーエバークリニック明洞の利用規約。',
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

const CONTENT: Record<
  string,
  { heading: string; sections: { title: string; body: string }[] }
> = {
  ko: {
    heading: '이용약관',
    sections: [
      {
        title: '제1조 (목적)',
        body: '이 약관은 포에버 클리닉 명동(이하 "클리닉")이 제공하는 온라인 상담 및 예약 서비스(이하 "서비스")의 이용 조건 및 절차, 기타 필요한 사항을 규정함을 목적으로 합니다.',
      },
      {
        title: '제2조 (약관의 효력 및 변경)',
        body: '① 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.\n② 클리닉은 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 홈페이지를 통해 공지합니다.',
      },
      {
        title: '제3조 (서비스의 제공)',
        body: '클리닉은 다음과 같은 서비스를 제공합니다.\n\n· 온라인 상담 신청 및 예약 접수\n· 시술 정보 및 클리닉 안내\n· 기타 클리닉이 정하는 서비스',
      },
      {
        title: '제4조 (이용자의 의무)',
        body: '이용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다.\n\n· 허위 정보 입력\n· 타인의 정보 도용\n· 클리닉의 운영을 방해하는 행위\n· 기타 법령에 위반되는 행위',
      },
      {
        title: '제5조 (면책조항)',
        body: '클리닉은 천재지변, 불가항력, 또는 이용자의 귀책 사유로 인해 서비스 이용에 장애가 발생한 경우에 대해 책임을 지지 않습니다.',
      },
      {
        title: '제6조 (준거법 및 관할)',
        body: '이 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 클리닉 소재지를 관할하는 법원을 전속 관할로 합니다.',
      },
    ],
  },
  en: {
    heading: 'Terms of Service',
    sections: [
      {
        title: 'Article 1 (Purpose)',
        body: 'These terms govern the conditions and procedures for using the online consultation and reservation services (the "Service") provided by Forever Clinic Myeongdong (the "Clinic").',
      },
      {
        title: 'Article 2 (Effect and Modification)',
        body: '① These terms apply to all users who wish to use the Service.\n② The Clinic may amend these terms as necessary. Amendments will be announced on the website.',
      },
      {
        title: 'Article 3 (Services Provided)',
        body: 'The Clinic provides the following services.\n\n· Online consultation requests and reservation processing\n· Treatment information and clinic guidance\n· Other services as determined by the Clinic',
      },
      {
        title: 'Article 4 (User Obligations)',
        body: "Users must not engage in the following activities.\n\n· Entering false information\n· Misappropriating another person's information\n· Interfering with the Clinic's operations\n· Any other actions that violate applicable laws",
      },
      {
        title: 'Article 5 (Disclaimer)',
        body: 'The Clinic is not liable for service disruptions caused by natural disasters, force majeure, or the fault of the user.',
      },
      {
        title: 'Article 6 (Governing Law and Jurisdiction)',
        body: "These terms are governed by the laws of the Republic of Korea. Any disputes related to the use of the Service shall be subject to the exclusive jurisdiction of the court with jurisdiction over the Clinic's location.",
      },
    ],
  },
  zh: {
    heading: '服务条款',
    sections: [
      {
        title: '第1条（目的）',
        body: '本条款旨在规定永恒诊所明洞（以下简称"诊所"）提供的在线咨询及预约服务（以下简称"服务"）的使用条件、程序及其他相关事项。',
      },
      {
        title: '第2条（条款的效力及变更）',
        body: '① 本条款适用于所有希望使用本服务的用户。\n② 诊所可根据需要修改本条款，修改内容将在官网上公告。',
      },
      {
        title: '第3条（服务内容）',
        body: '诊所提供以下服务。\n\n· 在线咨询申请及预约受理\n· 项目信息及诊所介绍\n· 诊所确定的其他服务',
      },
      {
        title: '第4条（用户义务）',
        body: '用户在使用服务时，不得进行以下行为。\n\n· 填写虚假信息\n· 盗用他人信息\n· 妨碍诊所运营的行为\n· 其他违反法律法规的行为',
      },
      {
        title: '第5条（免责条款）',
        body: '因不可抗力、自然灾害或用户原因导致服务中断的，诊所不承担责任。',
      },
      {
        title: '第6条（适用法律及管辖）',
        body: '本条款依据大韩民国法律解释，与服务使用相关的纠纷由诊所所在地有管辖权的法院专属管辖。',
      },
    ],
  },
  ja: {
    heading: '利用規約',
    sections: [
      {
        title: '第1条（目的）',
        body: '本規約は、フォーエバークリニック明洞（以下「クリニック」）が提供するオンライン相談・予約サービス（以下「サービス」）の利用条件および手順その他必要事項を定めることを目的とします。',
      },
      {
        title: '第2条（規約の効力および変更）',
        body: '① 本規約は、サービスを利用しようとするすべての利用者に適用されます。\n② クリニックは必要に応じて本規約を変更することができ、変更内容はウェブサイトで告知します。',
      },
      {
        title: '第3条（サービスの提供）',
        body: 'クリニックは以下のサービスを提供します。\n\n· オンライン相談申込および予約受付\n· 施術情報およびクリニック案内\n· その他クリニックが定めるサービス',
      },
      {
        title: '第4条（利用者の義務）',
        body: '利用者はサービス利用にあたり、以下の行為を行ってはなりません。\n\n· 虚偽情報の入力\n· 他人の情報の不正使用\n· クリニックの運営を妨げる行為\n· その他法令に違反する行為',
      },
      {
        title: '第5条（免責事項）',
        body: '天災、不可抗力、または利用者の帰責事由によりサービスの利用に支障が生じた場合、クリニックは責任を負いません。',
      },
      {
        title: '第6条（準拠法および管轄）',
        body: '本規約は大韓民国の法律に従って解釈され、サービスの利用に関する紛争は、クリニックの所在地を管轄する裁判所を専属的合意管轄とします。',
      },
    ],
  },
};

export default async function TermsPage({
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
