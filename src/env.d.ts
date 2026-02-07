/// <reference types="../worker-configuration.d.ts" />

// Extend the Cloudflare Env interface with secrets
declare namespace Cloudflare {
  interface Env {
    BETTER_AUTH_SECRET: string
  }
}
