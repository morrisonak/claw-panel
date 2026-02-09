// OpenClaw API integration

interface GatewayStatus {
  ok: boolean;
  uptime?: number;
  sessions?: number;
  agents?: any[];
  lastCheck?: number;
}

interface SessionMetrics {
  activeSessions: number;
  totalSessions: number;
  avgTokensPerSession: number;
  totalTokens: number;
}

interface CostData {
  dailySpend: number;
  monthlySpend: number;
  dailyTokens: number;
  estimatedDaily: number;
  estimatedMonthly: number;
}

interface ModelUsage {
  model: string;
  tokensIn: number;
  tokensOut: number;
  callCount: number;
  costEstimate: number;
}

import { env } from 'cloudflare:workers'

const OPENCLAW_URL = (env as any).OPENCLAW_URL || 'http://localhost:18789';
const OPENCLAW_TOKEN = (env as any).OPENCLAW_TOKEN || '';

// Get gateway status — probe the HTTP endpoint
export async function getGatewayStatus(): Promise<GatewayStatus> {
  try {
    // The gateway serves HTML on all paths but returns 200 if alive
    const res = await fetch(`${OPENCLAW_URL}/`, {
      headers: { Authorization: `Bearer ${OPENCLAW_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    });
    return {
      ok: res.ok,
      lastCheck: Date.now(),
    };
  } catch (e) {
    return { ok: false };
  }
}

// List sessions — derived from health probe
export async function listSessions(): Promise<SessionMetrics> {
  // Gateway doesn't expose session list over HTTP, return basic info
  return { activeSessions: 1, totalSessions: 1, avgTokensPerSession: 0, totalTokens: 0 };
}

// List cron jobs
export async function listCronJobs() {
  try {
    const res = await fetch(`${OPENCLAW_URL}/cron/list`, {
      headers: { Authorization: `Bearer ${OPENCLAW_TOKEN}` },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    return data.result || [];
  } catch (e) {
    return [];
  }
}

// Add cron job
export async function addCronJob(job: any) {
  try {
    const res = await fetch(`${OPENCLAW_URL}/cron/add`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    throw new Error(`Failed to add cron job: ${e}`);
  }
}

// Delete cron job
export async function deleteCronJob(jobId: string) {
  try {
    const res = await fetch(`${OPENCLAW_URL}/cron/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${OPENCLAW_TOKEN}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (e) {
    throw new Error(`Failed to delete cron job: ${e}`);
  }
}

// Trigger heartbeat
export async function triggerHeartbeat(target?: string) {
  try {
    const res = await fetch(`${OPENCLAW_URL}/cron/wake`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode: 'now', ...(target && { target }) }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    throw new Error(`Failed to trigger heartbeat: ${e}`);
  }
}

// Get session status
export async function getSessionStatus(sessionKey?: string) {
  try {
    const url = sessionKey 
      ? `${OPENCLAW_URL}/session/${sessionKey}/status` 
      : `${OPENCLAW_URL}/status`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${OPENCLAW_TOKEN}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Restart gateway
export async function restartGateway() {
  try {
    const res = await fetch(`${OPENCLAW_URL}/gateway/restart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENCLAW_TOKEN}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (e) {
    throw new Error(`Failed to restart gateway: ${e}`);
  }
}

// Send a command to the main agent session (fire-and-forget)
export async function sendToMainSession(message: string): Promise<void> {
  const res = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${OPENCLAW_TOKEN}`,
      'Content-Type': 'application/json',
      'x-openclaw-session-key': 'agent:main:main',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
}

// Queue a task into the main agent session
export async function queueTask(taskId: string, title: string, prompt: string): Promise<void> {
  const message = `[DASHBOARD TASK ${taskId}] ${title}\n\n${prompt}\n\nWhen complete, update task ${taskId} via PUT /api/tasks/ with status and response.`;
  const res = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${OPENCLAW_TOKEN}`,
      'Content-Type': 'application/json',
      'x-openclaw-session-key': 'agent:main:main',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
}
