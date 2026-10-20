import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ShieldCheck, Clock, User, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const Route = createFileRoute('/admin/audit-log')({
  head: () => ({
    meta: [
      { title: 'Security Audit Log — Blend Admin' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminAuditLogPage,
});

interface LogEntry {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: string;
}

function AdminAuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      admin_email: 'studio@blenddecor.com',
      action: 'login',
      entity_type: 'auth',
      created_at: 'Just now',
      details: 'Successful administrator sign in',
    },
    {
      id: '2',
      admin_email: 'studio@blenddecor.com',
      action: 'update',
      entity_type: 'product',
      created_at: '2 hours ago',
      details: 'Updated price for "Ocean Blue Burl Resin Coffee Table" to ₹72,500',
    },
    {
      id: '3',
      admin_email: 'studio@blenddecor.com',
      action: 'create',
      entity_type: 'collection',
      created_at: 'Yesterday',
      details: 'Added new collection "Wall Art"',
    },
  ]);

  useEffect(() => {
    async function fetchLogs() {
      if (!isSupabaseConfigured) return;
      try {
        const { data } = await supabase
          .from('audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (data && data.length > 0) {
          setLogs(
            data.map((l: any) => ({
              id: l.id,
              admin_email: l.admin_email || 'admin@blenddecor.com',
              action: l.action,
              entity_type: l.entity_type,
              created_at: new Date(l.created_at).toLocaleString(),
              details: JSON.stringify(l.new_data || {}),
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching audit log:', err);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="border-b border-stone-800 pb-4">
        <h1 className="font-serif text-2xl font-semibold text-stone-100">Security Audit Log</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Immutable history of all logins, product changes, and price adjustments
        </p>
      </div>

      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-stone-950/40 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span className="font-medium text-stone-200">Recent Admin Activity</span>
          </div>
          <span>Showing latest recorded events</span>
        </div>

        <div className="divide-y divide-stone-800/60">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-stone-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      log.action === 'login'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : log.action === 'create'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {log.entity_type}
                  </span>
                </div>

                <p className="text-sm text-stone-200 pt-0.5">{log.details}</p>

                <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {log.admin_email}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {log.created_at}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
