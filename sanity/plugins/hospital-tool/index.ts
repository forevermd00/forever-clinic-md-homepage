import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { HospitalTool } from './HospitalTool';

export const hospitalAdminTool = definePlugin({
  name: 'hospital-admin-tool',
  tools: [
    {
      name: 'hospital',
      title: '병원 설정',
      component: HospitalTool,
      router: route.create('/', [
        route.create('/doctor/:selectedId'),
        route.create('/hero/:heroKey'),
        route.create('/qcard/:qcardId'),
      ]),
    },
  ],
});
