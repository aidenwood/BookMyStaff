import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'es-module-lexer';
import 'html-escaper';
import 'clsx';
import { N as NOOP_MIDDLEWARE_HEADER, h as decodeKey } from './chunks/astro/server_ceWcd7n_.mjs';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/aidenwood/Desktop/00%20-%20Aidxn/BookMyStaff/","adapterName":"@astrojs/netlify","routes":[{"file":"admin/notification-dashboard/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/notification-dashboard","isIndex":false,"type":"page","pattern":"^\\/admin\\/notification-dashboard\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"notification-dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/notification-dashboard.astro","pathname":"/admin/notification-dashboard","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"admin/notifications/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/notifications","isIndex":false,"type":"page","pattern":"^\\/admin\\/notifications\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"notifications","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/notifications.astro","pathname":"/admin/notifications","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"admin/service-areas/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/service-areas","isIndex":false,"type":"page","pattern":"^\\/admin\\/service-areas\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"service-areas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/service-areas.astro","pathname":"/admin/service-areas","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/integrations/sync","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/integrations/sync","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/integrations\\/sync\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"integrations","dynamic":false,"spread":false}],[{"content":"sync","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/integrations/sync.ts","pathname":"/api/integrations/sync","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/integrations/test","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/integrations/test","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/integrations\\/test\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"integrations","dynamic":false,"spread":false}],[{"content":"test","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/integrations/test.ts","pathname":"/api/integrations/test","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"auth/login/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/auth/login","isIndex":false,"type":"page","pattern":"^\\/auth\\/login\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/login.astro","pathname":"/auth/login","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"auth/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/auth","isIndex":false,"type":"page","pattern":"^\\/auth\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth.astro","pathname":"/auth","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"book/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/book","isIndex":false,"type":"page","pattern":"^\\/book\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book.astro","pathname":"/book","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"dashboard/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/?$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"manage-booking/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/manage-booking","isIndex":false,"type":"page","pattern":"^\\/manage-booking\\/?$","segments":[[{"content":"manage-booking","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/manage-booking.astro","pathname":"/manage-booking","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"settings/business/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/settings/business","isIndex":false,"type":"page","pattern":"^\\/settings\\/business\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"business","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/business.astro","pathname":"/settings/business","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"setup/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/setup","isIndex":false,"type":"page","pattern":"^\\/setup\\/?$","segments":[[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/setup.astro","pathname":"/setup","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"staff/add/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/staff/add","isIndex":false,"type":"page","pattern":"^\\/staff\\/add\\/?$","segments":[[{"content":"staff","dynamic":false,"spread":false}],[{"content":"add","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/staff/add.astro","pathname":"/staff/add","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"staff/availability/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/staff/availability","isIndex":false,"type":"page","pattern":"^\\/staff\\/availability\\/?$","segments":[[{"content":"staff","dynamic":false,"spread":false}],[{"content":"availability","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/staff/availability.astro","pathname":"/staff/availability","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"staff/schedule/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/staff/schedule","isIndex":false,"type":"page","pattern":"^\\/staff\\/schedule\\/?$","segments":[[{"content":"staff","dynamic":false,"spread":false}],[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/staff/schedule.astro","pathname":"/staff/schedule","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"staff/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/staff","isIndex":false,"type":"page","pattern":"^\\/staff\\/?$","segments":[[{"content":"staff","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/staff.astro","pathname":"/staff","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/notification-dashboard.B5gEeYc5.css"}],"routeData":{"route":"/auth/callback","isIndex":false,"type":"page","pattern":"^\\/auth\\/callback\\/?$","segments":[[{"content":"auth","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/auth/callback.astro","pathname":"/auth/callback","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/notification-dashboard.B5gEeYc5.css"},{"type":"inline","content":".calendar-container{max-width:900px;margin:0 auto;padding:20px}.rdp-months{gap:2rem!important;justify-content:center}.rdp-month{min-width:300px}.rdp-day.available{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #10b981;color:#065f46;font-weight:600;position:relative}.rdp-day.available:after{content:\"�\";position:absolute;top:2px;right:2px;font-size:8px;color:#10b981}.rdp-day.available:hover{background:linear-gradient(135deg,#a7f3d0,#6ee7b7);transform:scale(1.05);transition:all .2s ease}.staff-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin:24px 0}.staff-card{border:2px solid #e5e7eb;border-radius:16px;padding:24px;cursor:pointer;transition:all .3s ease;background:linear-gradient(145deg,#fff,#f9fafb);box-shadow:0 2px 8px #0000000a}.staff-card:hover{border-color:#3b82f6;box-shadow:0 8px 25px #3b82f626;transform:translateY(-2px)}.staff-card.selected{border-color:#3b82f6;background:linear-gradient(145deg,#eff6ff,#dbeafe);box-shadow:0 8px 25px #3b82f633}.staff-avatar{width:64px;height:64px;border-radius:50%;margin:0 auto 16px;overflow:hidden;border:3px solid #e5e7eb;transition:border-color .3s ease}.staff-card.selected .staff-avatar{border-color:#3b82f6}.staff-avatar img{width:100%;height:100%;-o-object-fit:cover;object-fit:cover}.avatar-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700}.staff-info{text-align:center}.staff-rating{margin-top:8px;font-size:14px;color:#6b7280}.time-slots-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:24px 0}.time-slot{padding:16px 20px;border:2px solid #e5e7eb;border-radius:12px;background:linear-gradient(145deg,#fff,#f9fafb);cursor:pointer;transition:all .3s ease;font-weight:500;text-align:center;display:flex;align-items:center;justify-content:center;min-height:48px}.time-slot:hover{border-color:#3b82f6;background:linear-gradient(145deg,#eff6ff,#dbeafe);transform:translateY(-1px);box-shadow:0 4px 12px #3b82f626}.time-slot.selected{background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-color:#1d4ed8;color:#fff;box-shadow:0 6px 20px #3b82f64d}.time-slot.disabled{background:#f3f4f6;border-color:#d1d5db;color:#9ca3af;cursor:not-allowed}.btn-next-available{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:18px 32px;border-radius:12px;font-weight:700;cursor:pointer;transition:all .3s ease;box-shadow:0 6px 20px #667eea4d}.btn-next-available:hover{transform:translateY(-3px);box-shadow:0 10px 30px #667eea66}.btn-next-available:active{transform:translateY(-1px)}@media (max-width: 1024px){.rdp-months{flex-direction:column!important;gap:1.5rem!important}.staff-grid{grid-template-columns:1fr}.time-slots-grid{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}@media (max-width: 640px){.calendar-container{padding:16px}.time-slots-grid{grid-template-columns:repeat(2,1fr)}.staff-card{padding:20px}}\n"}],"routeData":{"route":"/booking/[businessid]","isIndex":false,"type":"page","pattern":"^\\/booking\\/([^/]+?)\\/?$","segments":[[{"content":"booking","dynamic":false,"spread":false}],[{"content":"businessId","dynamic":true,"spread":false}]],"params":["businessId"],"component":"src/pages/booking/[businessId].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/admin/notification-dashboard.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/admin/notifications.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/admin/service-areas.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/auth.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/auth/callback.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/auth/login.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/book.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/booking/[businessId].astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/dashboard.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/manage-booking.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/settings/business.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/setup.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/staff.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/staff/add.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/staff/availability.astro",{"propagation":"none","containsHead":true}],["/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/staff/schedule.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/admin/notification-dashboard@_@astro":"pages/admin/notification-dashboard.astro.mjs","\u0000@astro-page:src/pages/admin/notifications@_@astro":"pages/admin/notifications.astro.mjs","\u0000@astro-page:src/pages/admin/service-areas@_@astro":"pages/admin/service-areas.astro.mjs","\u0000@astro-page:src/pages/api/integrations/sync@_@ts":"pages/api/integrations/sync.astro.mjs","\u0000@astro-page:src/pages/api/integrations/test@_@ts":"pages/api/integrations/test.astro.mjs","\u0000@astro-page:src/pages/auth/callback@_@astro":"pages/auth/callback.astro.mjs","\u0000@astro-page:src/pages/auth/login@_@astro":"pages/auth/login.astro.mjs","\u0000@astro-page:src/pages/auth@_@astro":"pages/auth.astro.mjs","\u0000@astro-page:src/pages/book@_@astro":"pages/book.astro.mjs","\u0000@astro-page:src/pages/booking/[businessId]@_@astro":"pages/booking/_businessid_.astro.mjs","\u0000@astro-page:src/pages/dashboard@_@astro":"pages/dashboard.astro.mjs","\u0000@astro-page:src/pages/manage-booking@_@astro":"pages/manage-booking.astro.mjs","\u0000@astro-page:src/pages/settings/business@_@astro":"pages/settings/business.astro.mjs","\u0000@astro-page:src/pages/setup@_@astro":"pages/setup.astro.mjs","\u0000@astro-page:src/pages/staff/add@_@astro":"pages/staff/add.astro.mjs","\u0000@astro-page:src/pages/staff/availability@_@astro":"pages/staff/availability.astro.mjs","\u0000@astro-page:src/pages/staff/schedule@_@astro":"pages/staff/schedule.astro.mjs","\u0000@astro-page:src/pages/staff@_@astro":"pages/staff.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BHbJXSpp.mjs","/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/Layout/Header":"_astro/Header.CzsUM1pF.js","/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/Auth/ProtectedRoute":"_astro/ProtectedRoute.Bb3H6I8K.js","/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/Auth/AuthContainer":"_astro/AuthContainer.D1fQQL3U.js","/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/Booking/BookingFlow":"_astro/BookingFlow.JLC1l8dQ.js","/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/components/DemoAccordion":"_astro/DemoAccordion.DQ54FTHF.js","@astrojs/react/client.js":"_astro/client.iyRyfpiz.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/login.-N5WCx9p.css","/_astro/notification-dashboard.B5gEeYc5.css","/_astro/AuthContainer.D1fQQL3U.js","/_astro/BookingFlow.JLC1l8dQ.js","/_astro/DemoAccordion.DQ54FTHF.js","/_astro/Header.CzsUM1pF.js","/_astro/ProtectedRoute.Bb3H6I8K.js","/_astro/_businessId_.FuBUK5MB.css","/_astro/alert._3G7AyJh.js","/_astro/authStore.Dbu4Kn0n.js","/_astro/button.CWDt3X9y.js","/_astro/client.iyRyfpiz.js","/_astro/clock.RkmiXQGw.js","/_astro/index.BP8_t0zE.js","/_astro/index.CpEW9Ta-.js","/_astro/jsx-runtime.22wztk-c.js","/_astro/map-pin.D1YqeE3u.js","/_astro/supabase.DFx33wYR.js","/_astro/user.Dbv_8SnT.js","/_astro/users.DxXKnXmy.js","/admin/notification-dashboard/index.html","/admin/notifications/index.html","/admin/service-areas/index.html","/api/integrations/sync","/api/integrations/test","/auth/login/index.html","/auth/index.html","/book/index.html","/dashboard/index.html","/manage-booking/index.html","/settings/business/index.html","/setup/index.html","/staff/add/index.html","/staff/availability/index.html","/staff/schedule/index.html","/staff/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"lBvgV3zQHymtjOWHinDKU4jM3xLwS/YJAAZPV6DhMMo=","experimentalEnvGetSecretEnabled":false});

export { manifest };
