import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'snsLink',
  title: 'SNS 링크',
  type: 'object',
  preview: {
    select: { platform: 'platform', label: 'label' },
    prepare({ platform, label }) {
      const platformLabels: Record<string, string> = {
        instagram: 'Instagram',
        youtube: 'YouTube',
        blog: 'Blog',
        wechat: 'WeChat',
        weibo: 'Weibo',
        xiaohongshu: 'Xiaohongshu',
      };
      return {
        title: platformLabels[platform] || platform || '(플랫폼 미선택)',
        subtitle: label || '',
      };
    },
  },
  fields: [
    defineField({
      name: 'platform',
      title: '플랫폼',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Blog', value: 'blog' },
          { title: 'WeChat', value: 'wechat' },
          { title: 'Weibo', value: 'weibo' },
          { title: 'Xiaohongshu', value: 'xiaohongshu' },
        ],
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
    }),
    defineField({
      name: 'label',
      title: '표시명',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: '로고 이미지',
      description: '메신저 아이콘/로고 이미지',
      type: 'image',
      options: { hotspot: false },
    }),
    defineField({
      name: 'qrCode',
      title: 'QR 이미지',
      description: '마우스 오버 시 노출되는 QR 코드 (등록 시에만 표시)',
      type: 'image',
      options: { hotspot: false },
    }),
    defineField({
      name: 'isVisible',
      title: '노출',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortKo',
      title: '정렬 순서 (한국어)',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'sortEn',
      title: '정렬 순서 (English)',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'sortZh',
      title: '정렬 순서 (中文)',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'sortJa',
      title: '정렬 순서 (日本語)',
      type: 'number',
      initialValue: 0,
    }),
  ],
});
