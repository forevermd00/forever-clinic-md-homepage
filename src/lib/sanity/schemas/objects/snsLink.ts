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
      name: 'displayLocales',
      title: '표시 언어',
      description: '이 메신저를 표시할 언어 (비워두면 전체 표시)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '한국어', value: 'ko' },
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
          { title: '日本語', value: 'ja' },
        ],
      },
    }),
  ],
});
