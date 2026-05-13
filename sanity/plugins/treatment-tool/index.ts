import { definePlugin } from 'sanity';
import { TreatmentTool } from './TreatmentTool';

export const treatmentTool = definePlugin({
  name: 'treatment-tool',
  tools: [
    {
      name: 'treatments',
      title: '시술 관리',
      component: TreatmentTool,
    },
  ],
});
