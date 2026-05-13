import { defineType, defineField, defineArrayMember } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export default defineType({
  name: 'doctor',
  title: '의료진 관리',
  type: 'document',
  preview: {
    select: {
      title: 'name.ko',
      subtitle: 'position.ko',
      media: 'profileImage',
    },
  },
  fields: [
    orderRankField({ type: 'doctor' }),
    defineField({
      name: 'name',
      title: '의사 이름',
      type: 'localizedString',
    }),
    defineField({
      name: 'position',
      title: '직위',
      type: 'localizedString',
    }),
    defineField({
      name: 'profileImage',
      title: '프로필 사진',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'philosophy',
      title: '진료 철학',
      type: 'localizedText',
    }),
    defineField({
      name: 'specialties',
      title: '전문 분야',
      type: 'array',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    defineField({
      name: 'licenseNumber',
      title: '면허 번호',
      type: 'string',
    }),
    defineField({
      name: 'isVisible',
      title: '노출 여부',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: '정렬 순서',
      description: '숫자가 작을수록 앞에 표시됩니다',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0).integer(),
    }),
  ],
});
