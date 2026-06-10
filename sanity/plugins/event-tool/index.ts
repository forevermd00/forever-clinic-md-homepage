import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { EventTool } from './EventTool';

export const eventAdminTool = definePlugin({
  name: 'event-admin-tool',
  tools: [
    {
      name: 'event',
      title: '이벤트',
      component: EventTool,
      router: route.create('/', [route.create('/:selectedId')]),
    },
  ],
});
