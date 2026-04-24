import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'snsLink',
  title: 'SNS Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: '플랫폼',
      type: 'string',
      options: {
        list: [
          'instagram',
          'youtube',
          'wechat',
          'line',
          'kakaotalk',
          'whatsapp',
          'blog',
          'facebook',
        ],
      },
    }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    defineField({ name: 'label', title: '표시명', type: 'string' }),
  ],
});
