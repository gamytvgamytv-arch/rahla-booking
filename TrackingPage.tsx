import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Store,
  User,
  Bike,
  Package,
  Navigation,
  CheckCircle2,
  Clock,
  Wallet,
  Lock,
  Unlock,
  Shield,
  Settings,
  Inbox,
  Check,
  X,
  Loader2,
  TrendingUp,
  Percent,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { supabase } from '@/lib/supabase';

type ShareType = 'percentage' | 'fixed' | 'mixed';

interface ProfitConfig {
  id: string;
  facility_share_type: ShareType;
  facility_share_value: number;
  platform_share_type: ShareType;
  platform_share_value: number;
  agent_share_type: ShareType;
  agent_share_value: number;
}

interface PricingRequest {
  id: string;
  requester_type: 'facility' | 'agent';
  requester_name: string;
  facility_name: string | null;
  requested_share_type: ShareType;
  requested_value: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
}

type TrackingStep = 0 | 1 | 2 | 3 | 4;

const STEP_CONFIG: { step: TrackingStep; icon: LucideIcon }[] = [
  { step: 0, icon: Package },
  { step: 1, icon: Store },
  { step: 2, icon: Bike },
  { step: 3, icon: Navigation },
  { step: 4, icon: CheckCircle2 },
];

function calculateShare(
  orderAmount: number,
  shareType: ShareType,
  shareValue: number,
): number {
  if (shareType === 'percentage') return orderAmount * (shareValue / 100);
  if (shareType === 'fixed') return shareValue;
  return orderAmount * (shareValue / 100);
}

export function TrackingPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, formatPrice, direction } = useApp();
  const ArrowBack = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [currentStep, setCurrentStep] = useState<TrackingStep>(0);
  const [holdReleased, setHoldReleased] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [agentProgress, setAgentProgress] = useState(0);

  // Profit config state
  const [config, setConfig] = useState<ProfitConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState<'saved' | 'error' | null>(null);

  // Pricing requests state
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState<'success' | 'error' | null>(null);

  // Form state
  const [reqType, setReqType] = useState<'facility' | 'agent'>('facility');
  const [reqName, setReqName] = useState('');
  const [reqFacilityName, setReqFacilityName] = useState('');
  const [reqShareType, setReqShareType] = useState<ShareType>('percentage');
  const [reqValue, setReqValue] = useState('');
  const [reqReason, setReqReason] = useState('');

  const orderAmountUSD = 48;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance tracking steps
  useEffect(() => {
    if (currentStep >= 4 || holdReleased) return;
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) return prev;
        return (prev + 1) as TrackingStep;
      });
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentStep, holdReleased]);

  // Animate agent position on the map
  useEffect(() => {
    if (currentStep < 1 || currentStep >= 4) return;
    setAgentProgress(0);
    const progInterval = setInterval(() => {
      setAgentProgress((p) => Math.min(p + 2, 100));
    }, 100);
    return () => clearInterval(progInterval);
  }, [currentStep]);

  // Load profit config and pricing requests from Supabase
  const loadData = useCallback(async () => {
    const [cfgRes, reqRes] = await Promise.all([
      supabase.from('profit_config').select('*').limit(1).maybeSingle(),
      supabase.from('pricing_requests').select('*').order('created_at', { ascending: false }),
    ]);
    if (cfgRes.data) setConfig(cfgRes.data as ProfitConfig);
    setConfigLoading(false);
    if (reqRes.data) setRequests(reqRes.data as PricingRequest[]);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const facilityShare = config ? calculateShare(orderAmountUSD, config.facility_share_type, config.facility_share_value) : 0;
  const platformShare = config ? calculateShare(orderAmountUSD, config.platform_share_type, config.platform_share_value) : 0;
  const agentShare = config ? calculateShare(orderAmountUSD, config.agent_share_type, config.agent_share_value) : 0;
  const totalHeld = facilityShare + platformShare + agentShare;

  const handleConfirmReceipt = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setHoldReleased(true);
      setCurrentStep(4);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, 1500);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    setConfigMsg(null);
    const { error } = await supabase
      .from('profit_config')
      .update({
        facility_share_type: config.facility_share_type,
        facility_share_value: config.facility_share_value,
        platform_share_type: config.platform_share_type,
        platform_share_value: config.platform_share_value,
        agent_share_type: config.agent_share_type,
        agent_share_value: config.agent_share_value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);
    setSavingConfig(false);
    setConfigMsg(error ? 'error' : 'saved');
    setTimeout(() => setConfigMsg(null), 3000);
  };

  const handleSubmitRequest = async () => {
    if (!reqName.trim() || !reqValue.trim()) return;
    setSubmittingRequest(true);
    setRequestMsg(null);
    const { error } = await supabase.from('pricing_requests').insert({
      requester_type: reqType,
      requester_name: reqName,
      facility_name: reqType === 'facility' ? reqFacilityName : null,
      requested_share_type: reqShareType,
      requested_value: parseFloat(reqValue),
      reason: reqReason || null,
      status: 'pending',
    });
    setSubmittingRequest(false);
    if (error) {
      setRequestMsg('error');
    } else {
      setRequestMsg('success');
      setReqName('');
      setReqFacilityName('');
      setReqValue('');
      setReqReason('');
      setTimeout(() => { setShowRequestForm(false); setRequestMsg(null); }, 2000);
      loadData();
    }
  };

  const handleReviewRequest = async (id: string, status: 'approved' | 'rejected') => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, reviewed_at: new Date().toISOString() } : r));
    await supabase
      .from('pricing_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  // Map positions (percentages on the SVG)
  const pharmacyPos = { x: 15, y: 50 };
  const customerPos = { x: 85, y: 50 };
  const agentX = pharmacyPos.x + (customerPos.x - pharmacyPos.x) * (agentProgress / 100);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-8 lg:py-10">
        <div className="container-x">
          <button
            onClick={() => onNavigate('facilities')}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-100 hover:text-white transition-colors mb-4"
          >
            <ArrowBack className="h-4 w-4" />
            {t.tracking.backToStore}
          </button>
          <h1 className="text-xl lg:text-2xl font-bold">{t.tracking.title}</h1>
          <p className="mt-1.5 text-primary-100 text-sm">{t.tracking.subtitle}</p>
        </div>
      </div>

      <div className="container-x py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* ===== Smart Tracking Map ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Map area */}
          <div className="relative h-64 lg:h-80 bg-gradient-to-br from-neutral-100 via-neutral-50 to-primary-50/30 overflow-hidden">
            {/* Grid lines for map texture */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Route path */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path
                d={`M ${pharmacyPos.x} ${pharmacyPos.y} Q 50 20 ${customerPos.x} ${customerPos.y}`}
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="0.8"
                strokeDasharray="3 2"
                opacity="0.5"
              />
              {/* Traveled path */}
              {agentProgress > 0 && currentStep < 4 && (
                <path
                  d={`M ${pharmacyPos.x} ${pharmacyPos.y} Q ${50 * (agentProgress / 100)} ${20 * (agentProgress / 100)} ${agentX} ${pharmacyPos.y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
              )}
              {holdReleased && (
                <path
                  d={`M ${pharmacyPos.x} ${pharmacyPos.y} Q 50 20 ${customerPos.x} ${customerPos.y}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  opacity="0.9"
                />
              )}
            </svg>

            {/* Pharmacy marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${pharmacyPos.x}%`, top: `${pharmacyPos.y}%` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-4 ring-primary-100">
                <Store className="h-5 w-5" />
              </div>
              <span className="mt-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-primary-700 shadow-sm whitespace-nowrap">
                {t.tracking.pharmacy}
              </span>
            </div>

            {/* Customer marker */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${customerPos.x}%`, top: `${customerPos.y}%` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100">
                <User className="h-5 w-5" />
              </div>
              <span className="mt-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-indigo-700 shadow-sm whitespace-nowrap">
                {t.tracking.customer}
              </span>
            </div>

            {/* Agent marker (moving) */}
            {currentStep >= 1 && currentStep < 4 && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-100 ease-linear z-10"
                style={{ left: `${agentX}%`, top: `${pharmacyPos.y - 15}%` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-xl ring-4 ring-green-100 animate-pulse">
                  <Bike className="h-5 w-5" />
                </div>
                <span className="mt-1 rounded-full bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-green-700 shadow-sm whitespace-nowrap">
                  {t.tracking.agent}
                </span>
              </div>
            )}

            {/* Delivered checkmark */}
            {holdReleased && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-fade-in z-10"
                style={{ left: `${customerPos.x}%`, top: `${customerPos.y}%` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-4 ring-green-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>

          {/* Tracking steps timeline */}
          <div className="p-4 lg:p-6 border-t border-neutral-100">
            <div className="flex items-center justify-between gap-1">
              {STEP_CONFIG.map((s, idx) => {
                const Icon = s.icon;
                const isActive = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div key={s.step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className={`flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full transition-all ${
                          isActive
                            ? isCurrent
                              ? 'bg-primary-600 text-white ring-4 ring-primary-100 scale-110'
                              : 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                      </div>
                      <span className={`text-[10px] lg:text-xs font-medium text-center hidden sm:block ${isActive ? 'text-primary-700' : 'text-neutral-400'}`}>
                        {t.tracking[`step${s.step === 0 ? 'Preparing' : s.step === 1 ? 'PickedUp' : s.step === 2 ? 'OnTheWay' : s.step === 3 ? 'NearYou' : 'Delivered'}` as keyof typeof t.tracking]}
                      </span>
                    </div>
                    {idx < STEP_CONFIG.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1.5 transition-all duration-500 ${currentStep > s.step ? 'bg-primary-600' : 'bg-neutral-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current step description */}
            <div className="mt-4 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
              <p className="text-sm font-bold text-primary-700">
                {t.tracking[`step${currentStep === 0 ? 'Preparing' : currentStep === 1 ? 'PickedUp' : currentStep === 2 ? 'OnTheWay' : currentStep === 3 ? 'NearYou' : 'Delivered'}` as keyof typeof t.tracking]}
              </p>
              <p className="text-xs text-primary-600 mt-0.5">
                {t.tracking[`step${currentStep === 0 ? 'PreparingDesc' : currentStep === 1 ? 'PickedUpDesc' : currentStep === 2 ? 'OnTheWayDesc' : currentStep === 3 ? 'NearYouDesc' : 'DeliveredDesc'}` as keyof typeof t.tracking]}
              </p>
            </div>
          </div>
        </div>

        {/* ===== Financial Hold System ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 lg:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${holdReleased ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {holdReleased ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{t.tracking.holdTitle}</h2>
              <p className="text-sm text-neutral-500">{t.tracking.holdSubtitle}</p>
            </div>
            <div className="ms-auto">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${holdReleased ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <span className={`h-2 w-2 rounded-full ${holdReleased ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                {holdReleased ? t.tracking.released : t.tracking.held}
              </span>
            </div>
          </div>

          {/* Financial breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{t.tracking.orderAmount}</p>
              <p className="text-lg font-bold text-neutral-900 mt-1">{formatPrice(orderAmountUSD)}</p>
            </div>
            <div className={`rounded-xl border p-4 transition-all ${holdReleased ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{t.tracking.facilityShare}</p>
              <p className={`text-lg font-bold mt-1 ${holdReleased ? 'text-green-700' : 'text-neutral-900'}`}>{formatPrice(facilityShare)}</p>
            </div>
            <div className={`rounded-xl border p-4 transition-all ${holdReleased ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{t.tracking.platformShare}</p>
              <p className={`text-lg font-bold mt-1 ${holdReleased ? 'text-green-700' : 'text-neutral-900'}`}>{formatPrice(platformShare)}</p>
            </div>
            <div className={`rounded-xl border p-4 transition-all ${holdReleased ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">{t.tracking.agentShare}</p>
              <p className={`text-lg font-bold mt-1 ${holdReleased ? 'text-green-700' : 'text-neutral-900'}`}>{formatPrice(agentShare)}</p>
            </div>
          </div>

          {/* Total held + confirm button */}
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
              <p className="text-xs font-semibold text-primary-600">{t.tracking.totalHeld}</p>
              <p className="text-xl font-bold text-primary-700">{formatPrice(totalHeld)}</p>
            </div>
            {holdReleased ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 px-5 py-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-700">{t.tracking.receiptConfirmed}</p>
                  <p className="text-xs text-green-600">{t.tracking.fundsReleasedDesc}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConfirmReceipt}
                disabled={confirming || currentStep < 3}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {confirming ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.tracking.confirming}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    {t.tracking.confirmReceipt}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ===== Profit Configuration Panel ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 lg:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">{t.tracking.configTitle}</h2>
              <p className="text-sm text-neutral-500">{t.tracking.configSubtitle}</p>
            </div>
          </div>

          {configLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
            </div>
          ) : config ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {([
                  { key: 'facility', label: t.tracking.facilityShareLabel, icon: Store },
                  { key: 'platform', label: t.tracking.platformShareLabel, icon: Shield },
                  { key: 'agent', label: t.tracking.agentShareLabel, icon: Bike },
                ] as const).map((party) => {
                  const Icon = party.icon;
                  const typeKey = `${party.key}_share_type` as keyof ProfitConfig;
                  const valKey = `${party.key}_share_value` as keyof ProfitConfig;
                  return (
                    <div key={party.key} className="rounded-xl border border-neutral-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-bold text-neutral-900">{party.label}</span>
                      </div>
                      {/* Share type selector */}
                      <div className="flex gap-1.5 mb-3">
                        {(['percentage', 'fixed', 'mixed'] as ShareType[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => setConfig((c) => c ? { ...c, [typeKey]: st } : c)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                              config[typeKey] === st
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            }`}
                          >
                            {t.tracking[st]}
                          </button>
                        ))}
                      </div>
                      {/* Value input */}
                      <div className="relative">
                        <input
                          type="number"
                          value={config[valKey] as number}
                          onChange={(e) => setConfig((c) => c ? { ...c, [valKey]: parseFloat(e.target.value) || 0 } : c)}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3 text-sm font-bold text-neutral-900 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400">
                          {config[typeKey] === 'percentage' ? '%' : '$'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                <p className="text-xs font-bold text-neutral-500 mb-3">{t.tracking.previewTitle} — {t.tracking.previewDesc} {formatPrice(orderAmountUSD)}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400">{t.tracking.facilityShare}</p>
                    <p className="text-base font-bold text-primary-700">{formatPrice(facilityShare)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400">{t.tracking.platformShare}</p>
                    <p className="text-base font-bold text-primary-700">{formatPrice(platformShare)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-400">{t.tracking.agentShare}</p>
                    <p className="text-base font-bold text-primary-700">{formatPrice(agentShare)}</p>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40"
                >
                  {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {savingConfig ? t.tracking.saving : t.tracking.saveConfig}
                </button>
                {configMsg === 'saved' && <span className="text-sm font-medium text-green-600">{t.tracking.configSaved}</span>}
                {configMsg === 'error' && <span className="text-sm font-medium text-red-600">{t.tracking.configError}</span>}
              </div>
            </>
          ) : null}
        </div>

        {/* ===== Pricing Requests ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{t.tracking.requestsTitle}</h2>
                <p className="text-sm text-neutral-500">{t.tracking.requestsSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
            >
              <TrendingUp className="h-4 w-4" />
              {t.tracking.submitRequest}
            </button>
          </div>

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-neutral-700">{t.tracking.waitingReview}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{pendingRequests.length}</span>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${req.requester_type === 'facility' ? 'bg-primary-100 text-primary-700' : 'bg-green-100 text-green-700'}`}>
                            {req.requester_type === 'facility' ? <Store className="h-3 w-3" /> : <Bike className="h-3 w-3" />}
                            {req.requester_type === 'facility' ? t.tracking.facility : t.tracking.agentRole}
                          </span>
                          <span className="text-sm font-bold text-neutral-900">{req.requester_name}</span>
                          {req.facility_name && <span className="text-xs text-neutral-400">— {req.facility_name}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            {req.requested_share_type === 'percentage' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                            {t.tracking[req.requested_share_type]}: <strong className="text-neutral-700">{req.requested_value}{req.requested_share_type === 'percentage' ? '%' : '$'}</strong>
                          </span>
                          {req.reason && <span className="text-neutral-400 truncate max-w-xs">— {req.reason}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReviewRequest(req.id, 'approved')}
                          className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-green-600"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t.tracking.approve}
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req.id, 'rejected')}
                          className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t.tracking.reject}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed requests */}
          {reviewedRequests.length > 0 && (
            <div>
              <div className="space-y-2">
                {reviewedRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-neutral-700">{req.requester_name}</span>
                        <span className="text-xs text-neutral-400">— {t.tracking[req.requested_share_type]} {req.requested_value}{req.requested_share_type === 'percentage' ? '%' : '$'}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.status === 'approved' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {t.tracking[req.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <Inbox className="h-10 w-10 text-neutral-200 mb-3" />
              <p className="text-sm text-neutral-400">{t.tracking.noRequests}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== Request Form Modal ===== */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowRequestForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-neutral-900">{t.tracking.submitRequest}</h3>
              <button onClick={() => setShowRequestForm(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Requester type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.requesterType}</label>
                <div className="flex gap-2">
                  {(['facility', 'agent'] as const).map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setReqType(rt)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        reqType === rt ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {rt === 'facility' ? <Store className="h-4 w-4" /> : <Bike className="h-4 w-4" />}
                      {rt === 'facility' ? t.tracking.facility : t.tracking.agentRole}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.requesterName}</label>
                <input
                  type="text"
                  value={reqName}
                  onChange={(e) => setReqName(e.target.value)}
                  placeholder={t.tracking.requesterNamePlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                />
              </div>

              {/* Facility name (only for facility type) */}
              {reqType === 'facility' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.facilityName}</label>
                  <input
                    type="text"
                    value={reqFacilityName}
                    onChange={(e) => setReqFacilityName(e.target.value)}
                    placeholder={t.tracking.facilityNamePlaceholder}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                  />
                </div>
              )}

              {/* Requested type */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.requestedType}</label>
                <div className="flex gap-1.5">
                  {(['percentage', 'fixed', 'mixed'] as ShareType[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setReqShareType(st)}
                      className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                        reqShareType === st ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                      }`}
                    >
                      {t.tracking[st]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requested value */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.requestedValue}</label>
                <input
                  type="number"
                  value={reqValue}
                  onChange={(e) => setReqValue(e.target.value)}
                  placeholder={reqShareType === 'percentage' ? '85' : '15'}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.tracking.requestReason}</label>
                <textarea
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder={t.tracking.requestReasonPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitRequest}
                disabled={submittingRequest || !reqName.trim() || !reqValue.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                {submittingRequest ? t.tracking.submitting : t.tracking.submit}
              </button>

              {requestMsg === 'success' && <p className="text-sm font-medium text-green-600 text-center">{t.tracking.submitSuccess}</p>}
              {requestMsg === 'error' && <p className="text-sm font-medium text-red-600 text-center">{t.tracking.submitError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
