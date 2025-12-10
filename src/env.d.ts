/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PIPEDRIVE_API_TOKEN: string
  readonly PIPEDRIVE_COMPANY_DOMAIN: string
  readonly JWT_SECRET: string
  readonly MOBISCROLL_LICENSE: string
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
  readonly SMTP_HOST: string
  readonly SMTP_PORT: string
  readonly SMTP_USER: string
  readonly SMTP_PASS: string
  readonly ZAPIER_WEBHOOK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}