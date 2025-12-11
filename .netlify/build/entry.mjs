import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_BHbJXSpp.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/notification-dashboard.astro.mjs');
const _page2 = () => import('./pages/admin/notifications.astro.mjs');
const _page3 = () => import('./pages/admin/service-areas.astro.mjs');
const _page4 = () => import('./pages/api/integrations/sync.astro.mjs');
const _page5 = () => import('./pages/api/integrations/test.astro.mjs');
const _page6 = () => import('./pages/auth/callback.astro.mjs');
const _page7 = () => import('./pages/auth/login.astro.mjs');
const _page8 = () => import('./pages/auth.astro.mjs');
const _page9 = () => import('./pages/book.astro.mjs');
const _page10 = () => import('./pages/booking/_businessid_.astro.mjs');
const _page11 = () => import('./pages/dashboard.astro.mjs');
const _page12 = () => import('./pages/manage-booking.astro.mjs');
const _page13 = () => import('./pages/settings/business.astro.mjs');
const _page14 = () => import('./pages/setup.astro.mjs');
const _page15 = () => import('./pages/staff/add.astro.mjs');
const _page16 = () => import('./pages/staff/availability.astro.mjs');
const _page17 = () => import('./pages/staff/schedule.astro.mjs');
const _page18 = () => import('./pages/staff.astro.mjs');
const _page19 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/notification-dashboard.astro", _page1],
    ["src/pages/admin/notifications.astro", _page2],
    ["src/pages/admin/service-areas.astro", _page3],
    ["src/pages/api/integrations/sync.ts", _page4],
    ["src/pages/api/integrations/test.ts", _page5],
    ["src/pages/auth/callback.astro", _page6],
    ["src/pages/auth/login.astro", _page7],
    ["src/pages/auth.astro", _page8],
    ["src/pages/book.astro", _page9],
    ["src/pages/booking/[businessId].astro", _page10],
    ["src/pages/dashboard.astro", _page11],
    ["src/pages/manage-booking.astro", _page12],
    ["src/pages/settings/business.astro", _page13],
    ["src/pages/setup.astro", _page14],
    ["src/pages/staff/add.astro", _page15],
    ["src/pages/staff/availability.astro", _page16],
    ["src/pages/staff/schedule.astro", _page17],
    ["src/pages/staff.astro", _page18],
    ["src/pages/index.astro", _page19]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "dc362f93-e25c-47cd-8527-d233ab5119b6"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
