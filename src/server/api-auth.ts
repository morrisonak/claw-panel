import { auth } from '~/lib/auth';
import { env } from 'cloudflare:workers';

// Check if request is authenticated via cookie session OR openclaw token
export async function requireApiAuth(request: Request): Promise<boolean> {
  // Check bearer token (for gateway/internal calls)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (token === (env as any).OPENCLAW_TOKEN) return true;
  }

  // Check cookie session (for browser)
  const cookie = request.headers.get('cookie');
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    const token = match ? match[1] : null;
    if (token) {
      const result = await auth.getSession(token);
      if (result) return true;
    }
  }

  return false;
}
