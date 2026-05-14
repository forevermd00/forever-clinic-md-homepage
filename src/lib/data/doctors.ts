import { sanityFetch } from '@/lib/sanity/fetch';
import { doctorsQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';
import type { Doctor } from '@/components/brand/DoctorCard';

/* ─── Sanity raw shape (GROQ projects locale-specific fields) ─── */

interface SanityDoctor {
  _id: string;
  name?: string;
  position?: string;
  philosophy?: string;
  specialties?: string[];
  careers?: string[];
  profileImage?: unknown;
  licenseNumber?: string;
}

function mapSanityDoctors(raw: SanityDoctor[]): Doctor[] {
  return raw.map((d) => ({
    name: d.name || '',
    specialty: d.specialties?.filter(Boolean).join(' · ') || d.position || '',
    bio: d.careers?.filter(Boolean).join('\n') || d.philosophy || '',
    photo: d.profileImage
      ? {
          src: urlFor(d.profileImage)?.width(400).height(500).url() || '',
          alt: d.name || '',
        }
      : undefined,
  }));
}

export async function getDoctors(locale: string): Promise<Doctor[]> {
  const data = await sanityFetch<SanityDoctor[]>(doctorsQuery, { locale });

  if (!data || data.length === 0) return [];

  return mapSanityDoctors(data);
}
