import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'clinicInfo',
  title: '운영 정보',
  type: 'document',
  fields: [
    defineField({ name: 'address', title: '주소', type: 'localizedString' }),
    defineField({ name: 'phone', title: '전화번호', type: 'string' }),
    defineField({ name: 'email', title: '이메일', type: 'string' }),
    defineField({
      name: 'businessHours',
      title: '진료시간',
      type: 'array',
      of: [{ type: 'businessHours' }],
    }),
    defineField({
      name: 'closedDayNotice',
      title: '휴진일 안내',
      type: 'localizedString',
    }),
    defineField({
      name: 'googleMapsEmbedUrl',
      title: 'Google Maps 임베드 URL',
      type: 'url',
    }),
    defineField({
      name: 'walkingGuide',
      title: '도보 안내',
      type: 'localizedString',
    }),
    defineField({
      name: 'snsLinks',
      title: 'SNS 링크',
      type: 'array',
      of: [{ type: 'snsLink' }],
    }),
    defineField({
      name: 'messengerLinks',
      title: '메신저 채널 링크',
      type: 'array',
      of: [{ type: 'snsLink' }],
    }),
  ],
});
