import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import nodemailer from 'nodemailer';

/* ================================================================
   이메일 발송 유틸 — Gmail OAuth2 (nodemailer)
   환경변수:
     GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER
   설정 없으면 발송 건너뜀 (개발 환경 안전)
================================================================ */
async function sendInquiryEmail(params: {
  name: string;
  phone: string;
  message?: string;
  treatments?: {
    treatmentName: string;
    packageLabel: string;
    quantity: number;
  }[];
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

  const treatmentRowsHtml = hasTreatments
    ? params
        .treatments!.map(
          (t) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${t.treatmentName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${t.packageLabel}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${t.quantity}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="3" style="padding:8px 12px;color:#999;">선택된 시술 없음</td></tr>`;

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

        <!-- 접수 정보 -->
        <tr>
          <td style="padding:28px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:6px;border:1px solid #eee;">
              <tr>
                <td style="padding:14px 16px;width:80px;color:#888;font-size:13px;border-bottom:1px solid #eee;">이름</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;">${params.name}</td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;border-bottom:1px solid #eee;">연락처</td>
                <td style="padding:14px 16px;font-size:14px;font-weight:600;border-bottom:1px solid #eee;">
                  <a href="tel:${params.phone}" style="color:#1a1a1a;text-decoration:none;">${params.phone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;color:#888;font-size:13px;">접수 시각</td>
                <td style="padding:14px 16px;font-size:13px;">${now}</td>
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
                  <th style="padding:9px 12px;text-align:center;font-size:12px;color:#888;font-weight:500;">수량</th>
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

  await transporter.sendMail({
    from: `포에버의원 명동점 <${user}>`,
    to: user,
    subject: `[상담문의] ${params.name} · ${params.phone} — ${treatmentSummary}`,
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

interface InquiryBody {
  name: string;
  phone: string;
  message?: string;
  treatments?: {
    treatmentSlug: string;
    treatmentName: string;
    packageLabel: string;
    quantity: number;
  }[];
  source?: string;
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
        };
      });
    }

    const doc = {
      _type: 'contactInquiry',
      name: body.name,
      phone: body.phone,
      message: body.message || undefined,
      selectedTreatments:
        selectedTreatments.length > 0 ? selectedTreatments : undefined,
      source: body.source || 'contact-form',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const result = await sanityWriteClient.create(doc);

    // 이메일 발송 (환경변수 없으면 건너뜀)
    sendInquiryEmail({
      name: body.name,
      phone: body.phone,
      message: body.message,
      treatments: body.treatments,
    }).catch((emailErr) => {
      // 이메일 발송 실패가 상담 접수에 영향을 주지 않도록 에러만 로깅
      console.error('[email] Failed to send inquiry notification:', emailErr);
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
