import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { BnaTool } from './BnaTool';

export const bnaAdminTool = definePlugin({
  name: 'bna-tool',
  tools: [
    {
      name: 'bna',
      title: 'BnA',
      component: BnaTool,
      router: route.create('/', [route.create('/:selectedId')]),
    },
  ],
});
