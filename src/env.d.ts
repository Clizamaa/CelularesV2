/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly FUNCIONARIOS_API_URL: string;
  readonly FUNCIONARIOS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
