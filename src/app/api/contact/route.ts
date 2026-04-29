import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'develop',
  apiVersion: '2026-04-25',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

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

    return NextResponse.json({ success: true, id: result._id });
  } catch (err) {
    console.error('[API] Contact inquiry error:', err);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 },
    );
  }
}
