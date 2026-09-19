import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Video,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Wallet,
  RefreshCw,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Receipt,
  History,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { supabase } from '@/lib/supabase';

interface InventoryItem {
  content_type: string;
  content_label: string;
  current_count: number;
  base_count: number;
  compound_rate: number;
  last_compounded_at: string | null;
}

interface WalletInfo {
  balance: number;
  total_earned: number;
  total_payouts: number;
  updated_at: string;
}

interface CompoundEntry {
  content_type: string;
  previous_count: number;
  added_count: number;
  new_count: number;
  week_number: number;
  triggered_by: string;
  run_at: string;
}

interface RevenueEntry {
  source_type: string;
  description: string;
  gross_amount: number;
  net_amount: number;
  is_platform_owned: boolean;
  created_at: string;
}

interface RevenueSummary {
  total_transactions: number;
  total_gross: number;
  total_net: number;
  platform_owned_net: number;
  specialist_share_total: number;
}

interface PlatformStats {
  inventory: InventoryItem[];
  wallet: WalletInfo | null;
  recent_compounds: CompoundEntry[];
  recent_revenue: RevenueEntry[];
  revenue_summary_30d: RevenueSummary | null;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-compounder`;

const ICONS: Record<string, typeof Video> = {
  paid_videos: Video,
  paid_articles: BookOpen,
  paid_courses: GraduationCap,
};

const TYPE_COLORS: Record<string, string> = {
  paid_videos: 'from-rose-500 to-pink-600',
  paid_articles: 'from-emerald-500 to-teal-600',
  paid_courses: 'from-amber-500 to-orange-600',
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n || 0);
}

function formatDate(s: string | null): string {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function CompounderPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { t, direction } = useApp();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      setStats(data as PlatformStats);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRun = async () => {
    setRunning(true);
    setToast(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };
      const res = await fetch(`${EDGE_FUNCTION_URL}?action=run`, { method: 'POST', headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data?.status === 'skipped') {
        setToast({ type: 'info', msg: t.compounder.runSkipped });
      } else {
        setToast({ type: 'success', msg: t.compounder.runSuccess });
      }
      await fetchStats();
    } catch {
      setToast({ type: 'error', msg: t.compounder.runError });
    } finally {
      setRunning(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const inventory = stats?.inventory || [];
  const wallet = stats?.wallet;
  const compounds = stats?.recent_compounds || [];
  const revenue = stats?.recent_revenue || [];
  const revSummary = stats?.revenue_summary_30d;

  const maxCount = inventory.length > 0 ? Math.max(...inventory.map((i) => i.current_count)) : 1;

  const typeLabel = (ct: string): string => {
    const map: Record<string, string> = {
      paid_videos: t.compounder.typeVideos,
      paid_articles: t.compounder.typeArticles,
      paid_courses: t.compounder.typeCourses,
    };
    return map[ct] || ct;
  };

  return (
    <div className="min-h-screen bg-neutral-50" dir={direction}>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="container-x relative py-10 lg:py-14">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white mb-6"
          >
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            {t.compounder.backToHome}
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {t.compounder.title}
                </h1>
              </div>
              <p className="text-sm text-white/70 max-w-2xl">{t.compounder.subtitle}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {t.compounder.refresh}
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                <Zap className={`h-4 w-4 ${running ? 'animate-pulse' : ''}`} />
                {running ? t.compounder.running : t.compounder.runNow}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-600 text-white'
            : toast.type === 'error' ? 'bg-red-600 text-white'
            : 'bg-sky-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" />
            : toast.type === 'error' ? <AlertCircle className="h-5 w-5" />
            : <Clock className="h-5 w-5" />}
            {toast.msg}
          </div>
        </div>
      )}

      <div className="container-x py-8 space-y-8">
        {loading && !stats ? (
          <div className="flex items-center justify-center py-32">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Auto-schedule banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-900">{t.compounder.autoSchedule}</p>
                <p className="text-xs text-emerald-700 mt-0.5">{t.compounder.autoScheduleDesc}</p>
              </div>
              <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                {t.compounder.everyMonday}
              </span>
            </div>

            {/* Inventory cards */}
            <div>
              <h2 className="text-lg font-bold text-neutral-900 mb-4">{t.compounder.inventory}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {inventory.map((item) => {
                  const Icon = ICONS[item.content_type] || BookOpen;
                  const colorGrad = TYPE_COLORS[item.content_type] || 'from-neutral-500 to-neutral-600';
                  const growthPercent = item.base_count > 0
                    ? ((item.current_count - item.base_count) / item.base_count * 100).toFixed(1)
                    : '0';
                  const barWidth = (item.current_count / maxCount) * 100;

                  return (
                    <div key={item.content_type} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 transition-all hover:shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colorGrad} text-white shadow-md`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">{typeLabel(item.content_type)}</p>
                          <p className="text-xs text-neutral-400">{t.compounder.growthRate}: {(item.compound_rate * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      {/* Big number */}
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-3xl font-bold text-neutral-900">{formatNum(item.current_count)}</span>
                        <span className="text-xs text-neutral-400 mb-1">{t.compounder.items}</span>
                      </div>

                      {/* Growth bar */}
                      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colorGrad} transition-all duration-500`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {/* Footer stats */}
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-neutral-400">{t.compounder.baseCount}: </span>
                          <span className="font-bold text-neutral-700">{formatNum(item.base_count)}</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span className="font-bold text-emerald-700">+{growthPercent}%</span>
                        </div>
                      </div>

                      {/* Last run */}
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-xs text-neutral-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{t.compounder.lastRun}: </span>
                        <span className="font-medium text-neutral-600">
                          {item.last_compounded_at ? formatDate(item.last_compounded_at) : t.compounder.neverRun}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wallet + Revenue Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Wallet card */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold">{t.compounder.walletBalance}</p>
                </div>
                <p className="text-3xl font-bold mb-4">{formatCurrency(wallet?.balance || 0)}</p>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{t.compounder.totalEarned}</span>
                    <span className="font-bold">{formatCurrency(wallet?.total_earned || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{t.compounder.totalPayouts}</span>
                    <span className="font-bold">{formatCurrency(wallet?.total_payouts || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue summary card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 lg:col-span-2">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{t.compounder.revenueTitle}</p>
                    <p className="text-xs text-neutral-400">{t.compounder.revenueLast30d}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-400 mb-1">{t.compounder.totalTransactions}</p>
                    <p className="text-xl font-bold text-neutral-900">{formatNum(revSummary?.total_transactions || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <p className="text-xs text-neutral-400 mb-1">{t.compounder.totalGross}</p>
                    <p className="text-xl font-bold text-neutral-900">{formatCurrency(revSummary?.total_gross || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-600 mb-1">{t.compounder.platformOwnedNet}</p>
                    <p className="text-xl font-bold text-emerald-700">{formatCurrency(revSummary?.platform_owned_net || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs text-amber-600 mb-1">{t.compounder.specialistShare}</p>
                    <p className="text-xl font-bold text-amber-700">{formatCurrency(revSummary?.specialist_share_total || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column: Compound log + Revenue log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Compound audit log */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 p-5 border-b border-neutral-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <History className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">{t.compounder.compoundLog}</p>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {compounds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Sparkles className="h-8 w-8 text-neutral-300 mb-2" />
                      <p className="text-xs text-neutral-400">{t.compounder.neverRun}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-50">
                      {compounds.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">
                            {c.week_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-neutral-700 truncate">{typeLabel(c.content_type)}</p>
                            <p className="text-[10px] text-neutral-400">
                              {formatNum(c.previous_count)} → +{formatNum(c.added_count)} → {formatNum(c.new_count)}
                            </p>
                          </div>
                          <div className="text-end">
                            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                              c.triggered_by === 'pg_cron'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-sky-50 text-sky-600'
                            }`}>
                              {c.triggered_by}
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-1">{formatDate(c.run_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue ledger */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 p-5 border-b border-neutral-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <DollarSign className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-bold text-neutral-900">{t.compounder.revenueTitle}</p>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {revenue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Receipt className="h-8 w-8 text-neutral-300 mb-2" />
                      <p className="text-xs text-neutral-400">—</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-50">
                      {revenue.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors">
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            r.is_platform_owned ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-neutral-700 truncate">{r.description || r.source_type}</p>
                            <p className="text-[10px] text-neutral-400">
                              {r.is_platform_owned ? t.compounder.platformOwned : t.compounder.specialistContent}
                              {' · '}{formatDate(r.created_at)}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="text-xs font-bold text-neutral-900">{formatCurrency(r.net_amount)}</p>
                            <p className="text-[10px] text-neutral-400">{formatCurrency(r.gross_amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
