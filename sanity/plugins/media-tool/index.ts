import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { MediaTool } from './MediaTool';

export const mediaAdminTool = definePlugin({
  name: 'media-admin-tool',
  tools: [
    {
      name: 'media',
      title: '미디어',
      component: MediaTool,
      router: route.create('/', [route.create('/:docType/:selectedId')]),
    },
  ],
});
