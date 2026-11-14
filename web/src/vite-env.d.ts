/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 코치 서버(Cloudflare Worker) 주소. 예: https://gym-llm.<account>.workers.dev */
  readonly VITE_SERVER_URL?: string
  /** 서버 DEVICE_TOKEN_HASH에 등록된 토큰 원문 */
  readonly VITE_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
