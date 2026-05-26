import { definePlugin } from 'sanity';
import { route } from 'sanity/router';
import { SettingsTool } from '../hospital-tool/HospitalTool';

export const settingsAdminTool = definePlugin({
  name: 'settings-admin-tool',
  tools: [
    {
      name: 'settings',
      title: '설정',
      component: SettingsTool,
      router: route.create('/', [
        route.create('/qcard/:qcardId'),
        route.create('/:tab'),
      ]),
    },
  ],
});
