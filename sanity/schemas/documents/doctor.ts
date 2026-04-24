import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'doctor',
  title: '의료진',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '이름',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'position', title: '직위', type: 'localizedString' }),
    defineField({
      name: 'profileImage',
      title: '프로필 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'philosophy',
      title: '진료 철학',
      type: 'localizedString',
    }),
    defineField({ name: 'licenseNumber', title: '면허번호', type: 'string' }),
    defineField({
      name: 'specialties',
      title: '전문 분야',
      type: 'array',
      of: [{ type: 'localizedString' }],
    }),
    defineField({
      name: 'careers',
      title: '경력',
      type: 'array',
      of: [{ type: 'localizedString' }],
    }),
    defineField({
      name: 'sortOrder',
      title: '노출 순서',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});
