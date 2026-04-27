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
  ],
});
