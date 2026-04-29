import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'localizedBlockContent',
  title: '다국어 리치 텍스트',
  type: 'object',
  fields: [
    defineField({
      name: 'ko',
      title: '한국어',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '본문', value: 'normal' },
            { title: '제목 2', value: 'h2' },
            { title: '제목 3', value: 'h3' },
            { title: '제목 4', value: 'h4' },
            { title: '인용', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: '대체 텍스트',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: '캡션',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'zh',
      title: '中文',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '正文', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: '引用', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '链接',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: '替代文本',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: '图片说明',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'ja',
      title: '日本語',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '本文', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: '引用', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'リンク',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: '代替テキスト',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'キャプション',
            }),
          ],
        }),
      ],
    }),
  ],
});
