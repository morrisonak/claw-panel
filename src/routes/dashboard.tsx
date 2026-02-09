import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '~/lib/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const cookie = headers.get('cookie');
  if (!cookie) throw redirect({ to: '/login' });
  const match = cookie.match(/auth_token=([^;]+)/);
  const token = match ? match[1] : null;
  if (!token) throw redirect({ to: '/login' });
  const result = await auth.getSession(token);
  if (!result) throw redirect({ to: '/login' });
  return result;
});

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await getAuthSession();
  },
  component: Dashboard,
});

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'monitor' | 'control' | 'logs'>('tasks');
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['metrics', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/metrics/status');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: cost } = useQuery({
    queryKey: ['metrics', 'cost'],
    queryFn: async () => {
      const res = await fetch('/api/metrics/cost');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed');
      return res.json() as Promise<{ tasks: any[] }>;
    },
    refetchInterval: 5000,
  });
  const tasks = tasksData?.tasks || [];

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      setPrompt('');
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const heartbeatMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/metrics/heartbeat', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/metrics/restart', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      setShowRestartConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['metrics', 'status'] });
    },
  });

  const isOnline = status?.gateway?.ok || false;
  const pendingCount = tasks.filter((t: any) => t.status === 'pending').length;
  const completedCount = tasks.filter((t: any) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ WebkitTapHighlightColor: 'transparent' }}>
      
      {/* Top Bar — compact, native feel */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌊</span>
            <span className="font-semibold text-base">ClawPanel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-xs text-gray-400">
              {isOnline ? (status?.gateway?.uptime ? formatUptime(status.gateway.uptime) : 'Online') : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Strip — horizontal scroll on mobile */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {[
          { label: 'Gateway', value: isOnline ? '✓ Online' : '✗ Offline', loading: statusLoading },
          { label: 'Sessions', value: status?.sessions?.activeSessions ?? '—', loading: statusLoading },
          { label: 'Today', value: cost?.dailySpend != null ? `$${cost.dailySpend.toFixed(2)}` : '—', loading: false },
          { label: 'Tasks', value: `${pendingCount}⏳ ${completedCount}✓`, loading: tasksLoading },
        ].map((s) => (
          <div key={s.label} className="flex-shrink-0 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 min-w-[5.5rem]">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</div>
            {s.loading ? (
              <div className="h-5 bg-gray-700 animate-pulse rounded mt-1 w-12" />
            ) : (
              <div className="text-sm font-semibold mt-0.5 whitespace-nowrap">{s.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content — fills remaining space */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        
        {/* Tab Content */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            
            {/* Quick Task Input — compact card */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full bg-transparent text-sm font-medium text-gray-100 placeholder-gray-500 focus:outline-none mb-2"
              />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What should I do?"
                rows={2}
                className="w-full bg-transparent text-sm placeholder-gray-500 focus:outline-none resize-none text-gray-100"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => createTaskMutation.mutate()}
                  disabled={!title || !prompt || createTaskMutation.isPending}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-500 active:scale-95 transition-all disabled:bg-gray-700 disabled:text-gray-400"
                >
                  {createTaskMutation.isPending ? '...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Task List */}
            {tasksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-900 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <div className="text-sm">No tasks yet</div>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden active:bg-gray-800/50 transition-colors"
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            task.status === 'completed' ? 'bg-green-400' :
                            task.status === 'running' ? 'bg-blue-400 animate-pulse' :
                            task.status === 'failed' ? 'bg-red-400' :
                            'bg-yellow-400 animate-pulse'
                          }`} />
                          <span className="text-sm font-medium truncate">{task.title}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(task.created_at)}</span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-400 truncate pl-4">
                          {task.description.substring(0, 100)}
                        </p>
                      )}
                    </div>

                    {/* Expanded */}
                    {expandedTaskId === task.id && (
                      <div className="px-4 pb-4 border-t border-gray-700">
                        <div className="flex items-center gap-2 mt-3 mb-2">
                          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                            task.status === 'completed' ? 'bg-green-900/40 text-green-400' :
                            task.status === 'running' ? 'bg-blue-900/40 text-blue-400' :
                            task.status === 'failed' ? 'bg-red-900/40 text-red-400' :
                            'bg-yellow-900/40 text-yellow-400'
                          }`}>
                            {task.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">#{task.id.substring(0, 8)}</span>
                        </div>
                        {task.description && (
                          <div className="bg-gray-950 rounded-xl p-3 text-xs text-gray-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                            {task.description}
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTaskMutation.mutate(task.id); }}
                            className="text-xs text-red-400 hover:text-red-300 active:scale-95 transition-all px-3 py-1.5 rounded-full bg-red-900/20"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Gateway</h3>
              <div className="space-y-3">
                {[
                  ['Status', isOnline ? '🟢 Online' : '🔴 Offline'],
                  ['Sessions', `${status?.sessions?.activeSessions ?? '—'} active`],
                  ['Tasks Total', `${status?.tasks?.total ?? tasks.length}`],
                  ['Completed', `${status?.tasks?.completed ?? completedCount}`],
                  ['Pending', `${status?.tasks?.pending ?? pendingCount}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3">Cost</h3>
              <div className="space-y-3">
                {[
                  ['Daily Spend', `$${cost?.dailySpend?.toFixed(2) ?? '0.00'}`],
                  ['Budget Used', `${cost?.usagePercent ?? 0}%`],
                  ['Monthly Est.', `$${cost?.estimatedMonthly?.toFixed(2) ?? '0.00'}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('logs')}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-left active:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">📝 Activity Log</div>
                  <div className="text-xs text-gray-400 mt-0.5">{tasks.length} events</div>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'control' && (
          <div className="space-y-3">
            <button
              onClick={() => heartbeatMutation.mutate()}
              disabled={heartbeatMutation.isPending}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-left active:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">💓 Trigger Heartbeat</div>
                  <div className="text-xs text-gray-400 mt-0.5">Send a heartbeat pulse now</div>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            </button>
            {heartbeatMutation.isSuccess && (
              <div className="text-xs text-green-400 px-4">✓ Heartbeat sent</div>
            )}

            <button
              onClick={() => setShowRestartConfirm(true)}
              className="w-full bg-gray-900 border border-red-900/50 rounded-2xl p-4 text-left active:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-400">🔄 Restart Gateway</div>
                  <div className="text-xs text-gray-400 mt-0.5">Interrupts all active sessions</div>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-1">
            {tasksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-900 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-3xl mb-2">📝</div>
                <div className="text-sm">No activity yet</div>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-700" />
                
                {tasks.map((task: any, i: number) => {
                  const isCompleted = task.status === 'completed';
                  const isFailed = task.status === 'failed';
                  const isPending = task.status === 'pending';
                  const isRunning = task.status === 'running';
                  
                  return (
                    <div key={task.id} className="relative flex gap-3 py-2.5">
                      {/* Dot */}
                      <div className={`relative z-10 mt-1 w-[9px] h-[9px] rounded-full flex-shrink-0 ring-2 ring-gray-950 ${
                        isCompleted ? 'bg-green-400' :
                        isFailed ? 'bg-red-400' :
                        isRunning ? 'bg-blue-400 animate-pulse' :
                        'bg-yellow-400 animate-pulse'
                      }`} style={{ marginLeft: '11px' }} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium truncate">{task.title}</span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(task.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] ${
                            isCompleted ? 'text-green-400' :
                            isFailed ? 'text-red-400' :
                            isRunning ? 'text-blue-400' :
                            'text-yellow-400'
                          }`}>
                            {isCompleted ? 'Completed' : isFailed ? 'Failed' : isRunning ? 'Running' : 'Queued'}
                          </span>
                          <span className="text-[10px] text-gray-500">·</span>
                          <span className="text-[10px] text-gray-400 font-mono">#{task.id.substring(0, 8)}</span>
                        </div>
                        {isCompleted && task.description && (
                          <p className="text-[11px] text-gray-400 mt-1 truncate">{task.description.substring(0, 120)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tab Bar — native app feel */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 safe-bottom">
        <div className="flex justify-around py-2 pb-3 max-w-lg mx-auto">
          {[
            { id: 'tasks' as const, icon: '✅', label: 'Tasks' },
            { id: 'monitor' as const, icon: '📊', label: 'Monitor' },
            { id: 'control' as const, icon: '⚙️', label: 'Control' },
            { id: 'logs' as const, icon: '📝', label: 'Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-6 py-1 rounded-lg transition-colors ${
                activeTab === tab.id ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restart Confirm Sheet */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowRestartConfirm(false)}>
          <div
            className="w-full max-w-lg bg-gray-900 border-t border-gray-700 rounded-t-3xl p-6 pb-10 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Restart Gateway?</h3>
            <p className="text-sm text-gray-400 mb-6">This will interrupt all active sessions.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-100 rounded-xl font-medium active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium active:scale-95 transition-all disabled:bg-gray-700 disabled:text-gray-400"
              >
                {restartMutation.isPending ? 'Restarting...' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-top { padding-top: env(safe-area-inset-top); }
        .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}
