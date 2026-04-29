import { definePlugin } from 'sanity';
import { ConsultationTool } from './ConsultationTool';

export const consultationTool = definePlugin({
  name: 'consultation-tool',
  tools: [
    {
      name: 'consultations',
      title: '상담 관리',
      component: ConsultationTool,
    },
  ],
});
