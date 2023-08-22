/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    DIST_ELECTRON: string
    DIST: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

interface ImportMetaEnv {
  readonly VITE_DEVTOOLS_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
