/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_PROVIDER: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_GEMINI_MODEL: string
  readonly VITE_MISTRAL_API_KEY: string
  readonly VITE_MISTRAL_MODEL: string
  readonly VITE_LLM_TEMPERATURE: string
  readonly VITE_LLM_MAX_TOKENS: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
