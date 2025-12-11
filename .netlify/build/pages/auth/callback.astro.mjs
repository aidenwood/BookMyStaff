/* empty css                                                     */
import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_ceWcd7n_.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Layout } from '../../chunks/Layout_D5iQCTfD.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Callback = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Authenticating - BookMyStaff" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", `<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <div class="text-center"> <h1 class="text-3xl font-bold text-primary-600 mb-2">BookMyStaff</h1> <p class="text-gray-600 mb-8">Completing your sign in...</p> <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div> </div> </div> </div> <script type="module">
    import { supabase } from '../../lib/supabase'
    
    // Handle the auth callback
    async function handleAuthCallback() {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('OAuth callback error:', error)
          window.location.href = '/auth/login?error=' + encodeURIComponent(error.message)
          return
        }
        
        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          console.log('OAuth success, redirecting to dashboard')
          window.location.href = '/dashboard'
        } else {
          // No session, redirect back to login
          console.log('No session found, redirecting to login')
          window.location.href = '/auth/login'
        }
      } catch (err) {
        console.error('Callback handling error:', err)
        window.location.href = '/auth/login?error=callback_failed'
      }
    }
    
    // Run the callback handler
    handleAuthCallback()
  <\/script> `])), maybeRenderHead()) })}`;
}, "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/auth/callback.astro", void 0);

const $$file = "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/pages/auth/callback.astro";
const $$url = "/auth/callback";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Callback,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
