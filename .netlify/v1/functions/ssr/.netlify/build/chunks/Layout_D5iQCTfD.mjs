import { c as createComponent, a as createAstro, b as addAttribute, f as renderHead, g as renderSlot, r as renderTemplate } from './astro/server_ceWcd7n_.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                                          */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description = "BookMyStaff - Professional business booking platform" } = Astro2.props;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])}  </body> </html>`;
}, "/Users/aidenwood/Desktop/00 - Aidxn/BookMyStaff/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
