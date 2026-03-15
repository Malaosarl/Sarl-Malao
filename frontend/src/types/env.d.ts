/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_APP_TITLE: string;
  readonly more keys: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
