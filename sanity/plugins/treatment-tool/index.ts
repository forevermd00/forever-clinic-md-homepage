import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { TreatmentTool } from './TreatmentTool';

export const treatmentTool = definePlugin({
  name: 'treatment-tool',
  tools: [
    {
      name: 'treatments',
      title: '시술 관리',
      component: TreatmentTool,
      router: route.create('/', [route.create('/:selectedId')]),
    },
  ],
});
