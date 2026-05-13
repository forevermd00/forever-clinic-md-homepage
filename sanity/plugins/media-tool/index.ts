import { definePlugin } from 'sanity';
import { MediaTool } from './MediaTool';

export const mediaAdminTool = definePlugin({
  name: 'media-tool',
  tools: [
    {
      name: 'media',
      title: '미디어',
      component: MediaTool,
    },
  ],
});
