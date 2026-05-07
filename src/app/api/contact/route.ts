import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import nodemailer from 'nodemailer';

/* ================================================================
   이메일 발송 유틸 — Gmail SMTP 직접 발송 (nodemailer)
   환경변수:
     GMAIL_APP_PASSWORD — Gmail 앱 비밀번호 (2단계 인증 → 앱 비밀번호)
   설정 없으면 발송 건너뜀 (개발 환경 안전)
   수신·발신 모두 forevermd00@gmail.com
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
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    console.warn(
      '[email] GMAIL_APP_PASSWORD not set — skipping email notification',
    );
    return;
  }

  const CLINIC_EMAIL = 'forevermd00@gmail.com';

  const treatmentLines =
    params.treatments && params.treatments.length > 0
      ? params.treatments
          .map(
            (t) => `  - ${t.treatmentName} / ${t.packageLabel} × ${t.quantity}`,
          )
          .join('\n')
      : '  (없음)';

  const textBody = `
포에버의원 명동점 — 새 상담 문의가 접수되었습니다.

이름: ${params.name}
연락처: ${params.phone}
관심 시술:
${treatmentLines}
문의 내용: ${params.message || '(없음)'}

※ 이 메일은 자동 발송입니다.
`.trim();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CLINIC_EMAIL,
      pass: appPassword,
    },
  });

  await transporter.sendMail({
    from: `포에버의원 명동점 <${CLINIC_EMAIL}>`,
    to: CLINIC_EMAIL,
    subject: `[상담문의] ${params.name} / ${params.phone}`,
    text: textBody,
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
