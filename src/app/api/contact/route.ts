import { NextRequest, NextResponse, after } from 'next/server';
import { createClient } from '@sanity/client';
import nodemailer from 'nodemailer';
import {
  syncReservationToCrm,
  type ReservationSyncResult,
} from '@/lib/crm/sync';

// CRM 동기화(외부 API 호출 + 재시도)를 위해 함수 실행 시간 여유 확보
export const maxDuration = 30;

/* ================================================================
   이메일 발송 유틸 — Gmail OAuth2 (nodemailer)
   환경변수:
     GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER
   설정 없으면 발송 건너뜀 (개발 환경 안전)
================================================================ */
async function sendInquiryEmail(params: {
  name: string;
  birthDate?: string;
  email?: string;
  phone: string;
  messengerType?: string;
  messengerId?: string;
  message?: string;
  treatments?: CartLine[];
  /** 선택 시술 견적 합계 (원) */
  estimateTotal?: number;
  /** UTM 등 유입 출처 문자열 */
  attribution?: string;
  /** 고객이 가격을 확인한 시각 (ISO) */
  viewedAt?: string;
  preferredDate?: string;
  preferredTime?: string;
  crm?: ReservationSyncResult;
}): Promise<void> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.GMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken || !user) {
    console.warn(
      '[email] Gmail OAuth2 env vars not set — skipping email notification',
    );
    return;
  }

  const now = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const hasTreatments = params.treatments && params.treatments.length > 0;

  const messengerDisplay =
    params.messengerId && params.messengerType
      ? `${params.messengerType} · ${params.messengerId}`
      : params.messengerId
        ? params.messengerId
        : null;

  const preferredDatetimeDisplay =
    params.preferredDate && params.preferredTime
      ? `${params.preferredDate} ${params.preferredTime}`
      : params.preferredDate
        ? params.preferredDate
        : params.preferredTime
          ? params.preferredTime
          : null;

  // UTM/유입 출처 — "utm_source=ad;utm_content=d" 를 읽기 쉽게
  const attributionDisplay = params.attribution
    ? params.attribution.replace(/;/g, ' · ')
    : null;

  // 고객이 가격을 확인한 시각 (KST)
  const viewedAtDisplay = params.viewedAt
    ? new Date(params.viewedAt).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const statusTag = (s?: CartLine['priceStatus']) =>
    s === 'removed'
      ? ` <span style="display:inline-block;margin-left:4px;padding:1px 5px;border-radius:3px;background:#f3f3f3;color:#888;font-size:11px;font-weight:600;">판매종료</span>`
      : '';

  const estimateTotal =
    params.estimateTotal ??
    (hasTreatments
      ? params.treatments!.reduce((sum, t) => sum + lineAmount(t), 0)
      : 0);

  const treatmentRowsHtml = hasTreatments
    ? params
        .treatments!.map(
          (t) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${t.treatmentName}${statusTag(t.priceStatus)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${t.packageLabel}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;color:#666;">${t.unitPrice != null ? won(t.unitPrice) : '-'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${t.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${t.unitPrice != null ? won(lineAmount(t)) : '-'}</td>
        </tr>`,
        )
        .join('') +
      `
        <tr>
          <td colspan="4" style="padding:10px 12px;text-align:right;font-size:13px;color:#444;border-top:2px solid #eee;">합계 (부가세 별도)</td>
          <td style="padding:10px 12px;text-align:right;font-size:15px;font-weight:700;color:#a83c44;border-top:2px solid #eee;">${won(estimateTotal)}</td>
        </tr>`
    : `<tr><td colspan="5" style="padding:8px 12px;color:#999;">선택된 시술 없음</td></tr>`;

  // CRM 적재 상태 배너 (성공/실패/에러)
  const crm = params.crm;
  let crmBannerHtml = '';
  if (crm) {
    if (crm.status === 'success') {
      crmBannerHtml = `
        <tr>
          <td style="padding:0 32px;padding-top:20px;">
            <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:12px 16px;font-size:13px;color:#065f46;">
              ✅ <b>CRM 예약 적재 완료</b> · 고객번호 ${crm.customerNumber ?? '-'} · 예약번호 ${crm.reservationSeqNo ?? '-'}
            </div>
          </td>
        </tr>`;
    } else {
      crmBannerHtml = `
        <tr>
          <td style="padding:0 32px;padding-top:20px;">
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px 16px;font-size:13px;color:#991b1b;line-height:1.6;">
              ⚠️ <b>CRM 예약 적재 실패</b> — 수기 등록이 필요합니다.<br>
              단계: ${crm.failedStep ?? '-'}${crm.httpStatus ? ` · HTTP ${crm.httpStatus}` : ''}<br>
              사유: ${(crm.error ?? '알 수 없음').replace(/</g, '&lt;')}
            </div>
          </td>
        </tr>`;
    }
  }

  const htmlBody = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Malgun Gothic,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- 헤더 -->
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;">
            <p style="margin:0;color:#c9a96e;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Forever Clinic Myeongdong</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:600;">새 상담 문의가 접수되었습니다</h1>
          </td>
        </tr>
        ${crmBannerHtml}
        <!-- 접수 정보 -->
        <tr>
          <td style="padding:28px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:6px;border:1px solid #eee;">
              <tr>
                <td style="padding:14px 16px;width:80px;color:#888;font-size:13px;border-bottom:1px solid #eee;">이름</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;">${params.name}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">생년월일</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;${params.birthDate ? '' : 'color:#bbb;'}">${params.birthDate ?? '미입력'}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">연락처</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;">
                  <a href="tel:${params.phone}" style="color:#1a1a1a;text-decoration:none;">${params.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">이메일</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;${params.email ? '' : 'color:#bbb;'}">
                  ${params.email ? `<a href="mailto:${params.email}" style="color:#1a1a1a;text-decoration:none;">${params.email}</a>` : '미입력'}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">메신저</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;${messengerDisplay ? '' : 'color:#bbb;'}">${messengerDisplay ?? '미입력'}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">접수 시각</td>
                <td style="padding:14px 16px;font-size:13px;border-bottom:1px solid #eee;">${now}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">희망 예약일시</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;${preferredDatetimeDisplay ? 'color:#a83c44;' : 'color:#bbb;'}">
                  ${preferredDatetimeDisplay ?? '미선택'}
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">유입경로(UTM)</td>
                <td style="padding:14px 16px;font-size:13px;border-bottom:1px solid #eee;${attributionDisplay ? 'color:#1a1a1a;' : 'color:#bbb;'}">${attributionDisplay ?? '직접 유입'}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;">가격 확인 시각</td>
                <td style="padding:14px 16px;font-size:13px;${viewedAtDisplay ? 'color:#666;' : 'color:#bbb;'}">${viewedAtDisplay ?? '-'}<span style="color:#bbb;"> · 고객이 본 견적가 기준</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 관심 시술 -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;">관심 시술</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:500;">시술명</th>
                  <th style="padding:9px 12px;text-align:left;font-size:12px;color:#888;font-weight:500;">패키지</th>
                  <th style="padding:9px 12px;text-align:right;font-size:12px;color:#888;font-weight:500;">단가</th>
                  <th style="padding:9px 12px;text-align:center;font-size:12px;color:#888;font-weight:500;">수량</th>
                  <th style="padding:9px 12px;text-align:right;font-size:12px;color:#888;font-weight:500;">금액</th>
                </tr>
              </thead>
              <tbody>${treatmentRowsHtml}</tbody>
            </table>
          </td>
        </tr>

        <!-- 문의 내용 -->
        <tr>
          <td style="padding:24px 32px 0;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;">문의 내용</p>
            <div style="background:#fafafa;border:1px solid #eee;border-radius:6px;padding:14px 16px;font-size:14px;color:${params.message ? '#1a1a1a' : '#aaa'};line-height:1.7;min-height:48px;">
              ${params.message ? params.message.replace(/\n/g, '<br>') : '(없음)'}
            </div>
          </td>
        </tr>

        <!-- 푸터 -->
        <tr>
          <td style="padding:28px 32px;border-top:1px solid #f0f0f0;margin-top:28px;">
            <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">이 메일은 포에버의원 명동점 홈페이지에서 자동 발송됩니다.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const treatmentSummary = hasTreatments
    ? params.treatments!.map((t) => t.treatmentName).join(', ')
    : '시술 미선택';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user,
      clientId,
      clientSecret,
      refreshToken,
    },
  });

  const subjectDatetime = preferredDatetimeDisplay
    ? ` · 예약희망 ${preferredDatetimeDisplay}`
    : '';

  await transporter.sendMail({
    from: `포에버의원 명동점 <${user}>`,
    to: user,
    subject: `[상담문의] ${params.name} · ${params.phone}${subjectDatetime} — ${treatmentSummary}`,
    html: htmlBody,
  });
}

/* ================================================================
   고객 예약접수 완료 확인 메일 — 고객이 입력한 이메일로 발송
   locale에 맞는 언어로 발송 (ko/en/zh/ja)
================================================================ */
type ConfirmationContent = {
  fromName: string;
  subject: string;
  heading: string;
  greeting: (name: string) => string;
  body: string[];
  detailTitle: string;
  labelName: string;
  labelPhone: string;
  labelEmail: string;
  labelBirthDate: string;
  labelMessenger: string;
  labelDatetime: string;
  labelTreatments: string;
  labelMessage: string;
  noneValue: string;
  noneDatetime: string;
  noneTreatments: string;
  footer: string;
};

const CONFIRMATION_CONTENT: Record<string, ConfirmationContent> = {
  ko: {
    fromName: '포에버의원 명동점',
    subject: '[포에버의원 명동점] 상담 신청이 접수되었습니다',
    heading: '상담 신청이 접수되었습니다',
    greeting: (name) => `${name}님`,
    body: [
      '포에버의원 명동점에 문의해 주셔서 감사합니다.',
      '상담 신청이 정상적으로 접수되었습니다. 담당자가 순차적으로 연락드릴 예정이니 잠시만 기다려 주세요.',
    ],
    detailTitle: '신청 내용',
    labelName: '이름',
    labelPhone: '연락처',
    labelEmail: '이메일',
    labelBirthDate: '생년월일',
    labelMessenger: '메신저',
    labelDatetime: '희망 일시',
    labelTreatments: '관심 시술',
    labelMessage: '문의 내용',
    noneValue: '미입력',
    noneDatetime: '미지정',
    noneTreatments: '선택 없음',
    footer: '※ 본 메일은 포에버의원 명동점 홈페이지에서 자동 발송되었습니다.',
  },
  ja: {
    fromName: 'フォーエバークリニック明洞院',
    subject: '【フォーエバークリニック明洞】ご予約・ご相談を受け付けました',
    heading: 'ご予約・ご相談を受け付けました',
    greeting: (name) => `${name} 様`,
    body: [
      'この度はフォーエバークリニック明洞院にお問い合わせいただき、誠にありがとうございます。',
      'ご相談のお申し込みを受け付けいたしました。担当スタッフより順次ご連絡いたしますので、今しばらくお待ちください。',
    ],
    detailTitle: 'お申し込み内容',
    labelName: 'お名前',
    labelPhone: '電話番号',
    labelEmail: 'メールアドレス',
    labelBirthDate: '生年月日',
    labelMessenger: 'メッセンジャー',
    labelDatetime: 'ご希望日時',
    labelTreatments: '関心のある施術',
    labelMessage: 'お問い合わせ内容',
    noneValue: '未入力',
    noneDatetime: '指定なし',
    noneTreatments: '選択なし',
    footer:
      '※ 本メールはフォーエバークリニック明洞院のホームページから自動送信されています。',
  },
  en: {
    fromName: 'Forever Clinic Myeongdong',
    subject: "[Forever Clinic Myeongdong] We've received your inquiry",
    heading: 'Your inquiry has been received',
    greeting: (name) => `Dear ${name},`,
    body: [
      'Thank you for contacting Forever Clinic Myeongdong.',
      'Your consultation request has been received successfully. Our staff will contact you shortly.',
    ],
    detailTitle: 'Your request',
    labelName: 'Name',
    labelPhone: 'Phone',
    labelEmail: 'Email',
    labelBirthDate: 'Date of birth',
    labelMessenger: 'Messenger',
    labelDatetime: 'Preferred date/time',
    labelTreatments: 'Treatments of interest',
    labelMessage: 'Message',
    noneValue: 'Not provided',
    noneDatetime: 'Not specified',
    noneTreatments: 'None selected',
    footer:
      '※ This email was sent automatically from the Forever Clinic Myeongdong website.',
  },
  zh: {
    fromName: 'Forever明洞医院',
    subject: '【Forever明洞】您的咨询已成功受理',
    heading: '您的咨询已成功受理',
    greeting: (name) => `${name} 您好，`,
    body: [
      '感谢您咨询Forever明洞医院。',
      '您的咨询申请已成功受理，工作人员将尽快与您联系，请您耐心等待。',
    ],
    detailTitle: '申请内容',
    labelName: '姓名',
    labelPhone: '联系电话',
    labelEmail: '电子邮箱',
    labelBirthDate: '出生年月日',
    labelMessenger: '通讯软件',
    labelDatetime: '希望日期时间',
    labelTreatments: '感兴趣的项目',
    labelMessage: '咨询内容',
    noneValue: '未填写',
    noneDatetime: '未指定',
    noneTreatments: '未选择',
    footer: '※ 本邮件由Forever明洞医院官网自动发送。',
  },
};

async function sendCustomerConfirmationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  messengerType?: string;
  messengerId?: string;
  message?: string;
  locale?: string;
  treatments?: { treatmentName: string }[];
  preferredDate?: string;
  preferredTime?: string;
}): Promise<void> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.GMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken || !user) {
    console.warn(
      '[email] Gmail OAuth2 env vars not set — skipping customer confirmation',
    );
    return;
  }

  const c =
    CONFIRMATION_CONTENT[params.locale ?? 'ko'] ?? CONFIRMATION_CONTENT.ko;

  const datetimeDisplay =
    params.preferredDate && params.preferredTime
      ? `${params.preferredDate} ${params.preferredTime}`
      : params.preferredDate || params.preferredTime || c.noneDatetime;

  const treatmentDisplay =
    params.treatments && params.treatments.length > 0
      ? params.treatments.map((t) => t.treatmentName).join(', ')
      : c.noneTreatments;

  const messengerDisplay =
    params.messengerId && params.messengerType
      ? `${params.messengerType} · ${params.messengerId}`
      : params.messengerId || c.noneValue;

  // 입력값 회신 행 — 값이 있을 때만 표시 (이름·연락처는 항상)
  const detailRow = (label: string, value: string) => `
                    <tr>
                      <td style="padding:6px 0;width:120px;color:#888;font-size:13px;vertical-align:top;">${label}</td>
                      <td style="padding:6px 0;font-size:14px;color:#1a1a1a;">${value}</td>
                    </tr>`;

  const hasDatetime = Boolean(params.preferredDate || params.preferredTime);
  const hasTreatments = Boolean(
    params.treatments && params.treatments.length > 0,
  );
  const hasMessage = Boolean(params.message && params.message.trim());

  const detailRowsHtml = [
    detailRow(c.labelName, params.name),
    params.phone ? detailRow(c.labelPhone, params.phone) : '',
    params.email ? detailRow(c.labelEmail, params.email) : '',
    params.birthDate ? detailRow(c.labelBirthDate, params.birthDate) : '',
    params.messengerId ? detailRow(c.labelMessenger, messengerDisplay) : '',
    hasDatetime ? detailRow(c.labelDatetime, datetimeDisplay) : '',
    hasTreatments ? detailRow(c.labelTreatments, treatmentDisplay) : '',
    hasMessage
      ? detailRow(c.labelMessage, params.message!.replace(/\n/g, '<br>'))
      : '',
  ].join('');

  const bodyHtml = c.body
    .map(
      (p) =>
        `<p style="margin:0 0 12px;font-size:14px;line-height:1.8;color:#444;">${p}</p>`,
    )
    .join('');

  const htmlBody = `
<!DOCTYPE html>
<html lang="${params.locale ?? 'ko'}">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',Hiragino Sans,'Microsoft YaHei',Malgun Gothic,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a1a1a;padding:24px 32px;">
            <p style="margin:0;color:#c9a96e;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Forever Clinic Myeongdong</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:600;">${c.heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1a1a1a;">${c.greeting(params.name)}</p>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:6px;border:1px solid #eee;">
              <tr>
                <td style="padding:8px 0 4px 16px;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:1px;">${c.detailTitle}</td>
              </tr>
              <tr>
                <td style="padding:0 16px 14px;">
                  <table width="100%" cellpadding="0" cellspacing="0">${detailRowsHtml}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#bbb;text-align:center;">${c.footer}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { type: 'OAuth2', user, clientId, clientSecret, refreshToken },
  });

  await transporter.sendMail({
    from: `${c.fromName} <${user}>`,
    to: params.email,
    subject: c.subject,
    html: htmlBody,
  });
}

function getSanityClient() {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-04-25',
    token: process.env.SANITY_API_TOKEN!,
    useCdn: false,
  });
}

interface CartLine {
  treatmentSlug: string;
  treatmentName: string;
  packageLabel: string;
  quantity: number;
  /** 고객이 본(live 재대조) 단가 — 원, 부가세 별도 */
  unitPrice?: number;
  /** 가격 재대조 상태: ok=정상, removed=종료 */
  priceStatus?: 'ok' | 'removed' | 'pending';
}

/** 라인 합계 (수량×단가). 단가 없으면 0 */
function lineAmount(t: CartLine): number {
  return (t.unitPrice ?? 0) * t.quantity;
}

/** 원화 표기 */
function won(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

interface InquiryBody {
  name: string;
  birthDate?: string;
  email?: string;
  phone: string;
  /** 국가코드 제외 로컬 전화 숫자 (CRM 등록용). 없으면 phone에서 파싱 */
  cellPhone?: string;
  messengerType?: string;
  messengerId?: string;
  message?: string;
  /** 예약(상담)에 선택한 시술 */
  treatments?: CartLine[];
  /** 견적(장바구니 전체) 시술 — etcMemo 기록용 */
  estimateItems?: CartLine[];
  preferredDate?: string;
  preferredTime?: string;
  source?: string;
  locale?: string;
  /** UTM 등 유입 출처 문자열 (etcReservationFrom) */
  attribution?: string;
  /** 고객이 견적 가격을 마지막으로 확인한 시각 (ISO) — 가격 시점 명시 */
  viewedAt?: string;
}

/** CRM etcMemo 본문 구성 — 선택 시술 + 견적 시술 + 요구사항 원문 (이메일과 동일 정보) */
function buildEtcMemo(body: InquiryBody): string {
  const lines: string[] = ['[홈페이지 예약]'];

  const tag = (t: CartLine) =>
    t.priceStatus === 'removed' ? ' (판매종료)' : '';

  const fmt = (items: CartLine[]) =>
    items.map(
      (t) =>
        `- ${t.treatmentName} ${t.packageLabel} x${t.quantity}${
          t.unitPrice != null
            ? ` = ${won(lineAmount(t))} (단가 ${won(t.unitPrice)})`
            : ''
        }${tag(t)}`,
    );

  if (body.treatments && body.treatments.length > 0) {
    lines.push('', '■ 예약 선택 시술');
    lines.push(...fmt(body.treatments));
    const total = body.treatments.reduce((s, t) => s + lineAmount(t), 0);
    if (total > 0) lines.push(`합계: ${won(total)} (부가세 별도)`);
  }

  // 견적(장바구니 전체) 중 예약 선택에 없는 항목도 함께 기록
  if (body.estimateItems && body.estimateItems.length > 0) {
    const selectedKeys = new Set(
      (body.treatments ?? []).map(
        (t) => `${t.treatmentSlug}|${t.packageLabel}`,
      ),
    );
    const extra = body.estimateItems.filter(
      (e) => !selectedKeys.has(`${e.treatmentSlug}|${e.packageLabel}`),
    );
    if (extra.length > 0) {
      lines.push('', '■ 견적 시술 (장바구니)');
      lines.push(...fmt(extra));
    }
  }

  if (body.viewedAt) {
    const v = new Date(body.viewedAt).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
    lines.push('', `※ 가격은 고객이 ${v}에 확인한 견적가 기준`);
  }

  if (body.message && body.message.trim()) {
    lines.push('', '■ 요청사항', body.message.trim());
  }

  if (body.messengerId) {
    lines.push(
      '',
      `■ 메신저: ${body.messengerType ?? ''} ${body.messengerId}`.trim(),
    );
  }

  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  const sanityWriteClient = getSanityClient();
  try {
    const body: InquiryBody = await req.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 },
      );
    }

    // slug로 treatment _id 조회 + selectedTreatments 객체 배열 구성
    let selectedTreatments: {
      _type: string;
      _key: string;
      treatment?: { _type: string; _ref: string };
      name: string;
      packageLabel: string;
      quantity: number;
      unitPrice?: number;
      priceStatus?: string;
    }[] = [];

    if (body.treatments && body.treatments.length > 0) {
      const slugs = [...new Set(body.treatments.map((t) => t.treatmentSlug))];
      const treatments = await sanityWriteClient.fetch<
        { _id: string; slug: string }[]
      >(
        `*[_type == "treatment" && slug.current in $slugs]{ _id, "slug": slug.current }`,
        { slugs },
      );
      const slugToId = new Map(treatments.map((t) => [t.slug, t._id]));

      selectedTreatments = body.treatments.map((t, i) => {
        const id = slugToId.get(t.treatmentSlug);
        return {
          _type: 'object',
          _key: `treatment-${i}-${Date.now()}`,
          treatment: id ? { _type: 'reference', _ref: id } : undefined,
          name: t.treatmentName,
          packageLabel: t.packageLabel,
          quantity: t.quantity,
          unitPrice: t.unitPrice,
          priceStatus: t.priceStatus,
        };
      });
    }

    // 선택 시술 견적 합계 (고객이 본 live 단가 기준, 부가세 별도)
    const estimateTotal = (body.treatments ?? []).reduce(
      (sum, t) => sum + lineAmount(t),
      0,
    );

    const doc = {
      _type: 'contactInquiry',
      name: body.name,
      birthDate: body.birthDate || undefined,
      email: body.email || undefined,
      phone: body.phone,
      messengerType: body.messengerId ? body.messengerType : undefined,
      messengerId: body.messengerId || undefined,
      message: body.message || undefined,
      selectedTreatments:
        selectedTreatments.length > 0 ? selectedTreatments : undefined,
      estimateTotal: estimateTotal > 0 ? estimateTotal : undefined,
      estimateViewedAt: body.viewedAt || undefined,
      crmReservationFrom: body.attribution || undefined,
      preferredDate: body.preferredDate || undefined,
      preferredTime: body.preferredTime || undefined,
      source: body.source || 'contact-form',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const result = await sanityWriteClient.create(doc);

    // CRM 동기화(외부 API, 장애 시 수초 소요)와 이메일 발송은 응답 이후
    // 백그라운드에서 처리 → 사용자 대기시간 최소화. after()는 응답 flush 후
    // maxDuration 내에서 실행을 보장한다.
    after(async () => {
      // ── 스마트닥터 CRM 예약 적재 (실패해도 상담 접수는 성공 처리) ──
      // 시술명은 "원문 그대로"(이메일과 동일) etcMemo에 담는다.
      const reservationMemo =
        body.treatments && body.treatments.length > 0
          ? `[홈페이지예약] ${body.treatments
              .map((t) => `${t.treatmentName} ${t.packageLabel}`)
              .join(', ')}${
              estimateTotal > 0 ? ` / 견적합계 ${won(estimateTotal)}` : ''
            }`
          : '[홈페이지예약] 상담 신청';

      let crmResult: ReservationSyncResult | undefined;
      try {
        crmResult = await syncReservationToCrm({
          name: body.name,
          phone: body.cellPhone || body.phone,
          email: body.email,
          reservationDate: body.preferredDate,
          reservationTime: body.preferredTime,
          reservationMemo,
          etcMemo: buildEtcMemo(body),
          etcReservationFrom: body.attribution,
        });
      } catch (crmErr) {
        // syncReservationToCrm는 throw하지 않도록 설계되어 있으나 방어적으로 캐치
        console.error('[crm] 동기화 예외:', crmErr);
        crmResult = {
          status: 'failed',
          failedStep: 'reservation',
          error: crmErr instanceof Error ? crmErr.message : String(crmErr),
        };
      }

      // CRM 적재 결과를 상담 문의 문서에 역기록 → Studio "상담 관리"에서 확인
      try {
        await sanityWriteClient
          .patch(result._id)
          .set({
            crmSyncStatus: crmResult.status,
            crmCustomerNumber: crmResult.customerNumber,
            crmReservationSeqNo: crmResult.reservationSeqNo,
            crmReservationFrom: body.attribution,
            crmError: crmResult.error,
            crmSyncedAt: new Date().toISOString(),
          })
          .commit();
      } catch (patchErr) {
        console.error('[crm] 결과 역기록 실패:', patchErr);
      }

      // 병원 알림 메일 발송 (환경변수 없으면 건너뜀) — CRM 적재 상태 포함
      await sendInquiryEmail({
        name: body.name,
        birthDate: body.birthDate,
        email: body.email,
        phone: body.phone,
        messengerType: body.messengerId ? body.messengerType : undefined,
        messengerId: body.messengerId,
        message: body.message,
        treatments: body.treatments,
        estimateTotal,
        attribution: body.attribution,
        viewedAt: body.viewedAt,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        crm: crmResult,
      }).catch((emailErr) => {
        console.error('[email] Failed to send inquiry notification:', emailErr);
      });

      // 고객 예약접수 완료 확인 메일 발송 (이메일 입력 시에만)
      if (body.email) {
        await sendCustomerConfirmationEmail({
          name: body.name,
          email: body.email,
          phone: body.phone,
          birthDate: body.birthDate,
          messengerType: body.messengerId ? body.messengerType : undefined,
          messengerId: body.messengerId,
          message: body.message,
          locale: body.locale,
          treatments: body.treatments,
          preferredDate: body.preferredDate,
          preferredTime: body.preferredTime,
        }).catch((emailErr) => {
          console.error(
            '[email] Failed to send customer confirmation:',
            emailErr,
          );
        });
      }
    });

    return NextResponse.json({ success: true, id: result._id });
  } catch (err) {
    console.error('[API] Contact inquiry error:', err);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 },
    );
  }
}
