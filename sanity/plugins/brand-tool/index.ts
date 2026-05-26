import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { BrandTool } from '../hospital-tool/HospitalTool';

export const brandAdminTool = definePlugin({
  name: 'brand-admin-tool',
  tools: [
    {
      name: 'brand',
      title: '브랜드',
      component: BrandTool,
      router: route.create('/', [
        route.create('/doctor/:selectedId'),
        route.create('/:tab'),
      ]),
    },
  ],
});
