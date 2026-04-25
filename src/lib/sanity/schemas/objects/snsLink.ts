import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'snsLink',
  title: 'SNS Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
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
      type: 'string',
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
    }),
  ],
});
