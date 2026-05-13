import { definePlugin } from 'sanity';
import { HospitalTool } from './HospitalTool';

export const hospitalAdminTool = definePlugin({
  name: 'hospital-tool',
  tools: [
    {
      name: 'hospital',
      title: '병원 설정',
      component: HospitalTool,
    },
  ],
});
