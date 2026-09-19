import { useState, useMemo } from 'react';
import {
  Search,
  BadgeCheck,
  Star,
  Award,
  TrendingUp,
  CircleDot,
  Stethoscope,
  ChevronDown,
  Users,
  MessageSquare,
  Shield,
  Crown,
  UserPlus,
  Check,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';
import { SPECIALTIES } from '@/types/i18n';

interface Specialist {
  id: string;
  name: string;
  avatar: string;
  category: string;
  subSpecialty: string;
  subSpecialtyKey: string;
  bio: string;
  credentials: string;
  reputation: number;
  followers: number;
  answers: number;
  priceUSD: number;
  online: boolean;
  badges: string[];
}

const DEMO_SPECIALISTS: Specialist[] = [
  { id: '1', name: 'د. سارة المطيري', avatar: 'https://i.pravatar.cc/150?img=47', category: 'children', subSpecialtyKey: 'pediatricsNeonatal', subSpecialty: 'طب الأطفال وحديثي الولادة', bio: 'استشارية طب الأطفال مع 15 عاماً من الخبرة في رعاية الأطفال وحديثي الولادة', credentials: 'MBBS, FAAP', reputation: 18800, followers: 4800, answers: 1023, priceUSD: 16, online: true, badges: ['expert', 'topRated'] },
  { id: '2', name: 'د. أحمد الراشد', avatar: 'https://i.pravatar.cc/150?img=12', category: 'mentalHealth', subSpecialtyKey: 'psychiatrist', subSpecialty: 'طب نفسي', bio: 'استشاري الطب النفسي وعلاج الاكتئاب والقلق والوسواس القهري', credentials: 'MD, PhD', reputation: 12400, followers: 3200, answers: 856, priceUSD: 20, online: true, badges: ['topRated', 'mostReviewed'] },
  { id: '3', name: 'د. ليلى عبدالله', avatar: 'https://i.pravatar.cc/150?img=44', category: 'mentalHealth', subSpecialtyKey: 'psychotherapist', subSpecialty: 'العلاج النفسي', bio: 'أخصائية العلاج النفسي المعرفي السلوكي واضطرابات النوم', credentials: 'PsyD, CST', reputation: 9600, followers: 2100, answers: 540, priceUSD: 14, online: false, badges: ['expert'] },
  { id: '4', name: 'د. خالد العمري', avatar: 'https://i.pravatar.cc/150?img=13', category: 'otherSpecialties', subSpecialtyKey: 'cardiology', subSpecialty: 'طب القلب والأوعية', bio: 'استشاري أمراض القلب والقسطرة وجراحة القلب', credentials: 'MD, FACC', reputation: 15200, followers: 3900, answers: 720, priceUSD: 25, online: true, badges: ['topRated'] },
  { id: '5', name: 'د. نورا السالم', avatar: 'https://i.pravatar.cc/150?img=49', category: 'otherSpecialties', subSpecialtyKey: 'dermatology', subSpecialty: 'الأمراض الجلدية', bio: 'أخصائية الأمراض الجلدية والتجميل غير الجراحي', credentials: 'MD, FAAD', reputation: 8300, followers: 5600, answers: 410, priceUSD: 12, online: false, badges: ['mostReviewed'] },
  { id: '6', name: 'د. محمد القحطاني', avatar: 'https://i.pravatar.cc/150?img=14', category: 'children', subSpecialtyKey: 'behaviorModification', subSpecialty: 'تعديل سلوك الأطفال', bio: 'أخصائي تعديل السلوك واضطرابات فرط الحركة والتشتت', credentials: 'PhD, BCBA', reputation: 6700, followers: 1800, answers: 312, priceUSD: 10, online: true, badges: ['expert', 'topRated'] },
  { id: '7', name: 'د. هند الفهد', avatar: 'https://i.pravatar.cc/150?img=45', category: 'mentalHealth', subSpecialtyKey: 'sleepDisorders', subSpecialty: 'اضطرابات النوم', bio: 'أخصائية اضطرابات النوم والعلاج السلوكي للأرق', credentials: 'MD, CBSM', reputation: 5200, followers: 980, answers: 230, priceUSD: 11, online: false, badges: [] },
  { id: '8', name: 'د. عمر الحربي', avatar: 'https://i.pravatar.cc/150?img=15', category: 'otherSpecialties', subSpecialtyKey: 'orthopedics', subSpecialty: 'جراحة العظام', bio: 'استشاري جراحة العظام والكسور وإصابات الملاعب', credentials: 'MD, FAOA', reputation: 7100, followers: 2400, answers: 380, priceUSD: 18, online: true, badges: ['mostReviewed'] },
];

function formatStat(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

const BADGE_CONFIG: Record<string, { icon: LucideIcon; label: string; bg: string; text: string }> = {
  expert: { icon: Crown, label: 'badgeExpert', bg: 'bg-amber-100', text: 'text-amber-700' },
  topRated: { icon: Star, label: 'badgeTopRated', bg: 'bg-amber-100', text: 'text-amber-700' },
  mostReviewed: { icon: Award, label: 'badgeMostReviewed', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export function SpecialistsPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, formatPrice } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [subSpecialty, setSubSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'topRated' | 'mostAnswers' | 'mostFollowers'>('topRated');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const availableSubSpecialties = useMemo(() => {
    if (category === 'all') return [];
    const cat = SPECIALTIES.find((c) => c.key === category);
    return cat ? cat.items : [];
  }, [category]);

  const filtered = useMemo(() => {
    let list = [...DEMO_SPECIALISTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.subSpecialty.toLowerCase().includes(q));
    }
    if (category !== 'all') list = list.filter((s) => s.category === category);
    if (subSpecialty !== 'all') list = list.filter((s) => s.subSpecialtyKey === subSpecialty);
    if (onlineOnly) list = list.filter((s) => s.online);
    if (sortBy === 'topRated') list.sort((a, b) => b.reputation - a.reputation);
    if (sortBy === 'mostAnswers') list.sort((a, b) => b.answers - a.answers);
    if (sortBy === 'mostFollowers') list.sort((a, b) => b.followers - a.followers);
    return list;
  }, [search, category, subSpecialty, onlineOnly, sortBy]);

  const toggleFollow = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setSubSpecialty('all');
    setOnlineOnly(false);
  };

  const categoryItems = SPECIALTIES.map((c) => ({ key: c.key, label: t.mega[c.key as keyof typeof t.mega] as string }));

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Page header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-10 lg:py-14">
        <div className="container-x">
          <h1 className="text-2xl lg:text-3xl font-bold">{t.specialists.title}</h1>
          <p className="mt-2 text-primary-100 text-sm lg:text-base">{t.specialists.subtitle}</p>
        </div>
      </div>

      <div className="container-x py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary-600" />
                {t.specialists.filterTitle}
              </h2>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.specialists.searchPlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                />
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Category select */}
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.specialists.specialtyCategory}</label>
              <div className="relative mb-4">
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setSubSpecialty('all'); }}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-3 pe-9 text-sm text-neutral-900 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                >
                  <option value="all">{t.specialists.allCategories}</option>
                  {categoryItems.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>

              {/* Sub-specialty select */}
              {availableSubSpecialties.length > 0 && (
                <>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.specialists.subSpecialty}</label>
                  <div className="relative mb-4">
                    <select
                      value={subSpecialty}
                      onChange={(e) => setSubSpecialty(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-3 pe-9 text-sm text-neutral-900 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                    >
                      <option value="all">{t.specialists.allSpecialties}</option>
                      {availableSubSpecialties.map((s) => (
                        <option key={s.key} value={s.key}>{t.mega.sub[s.key]}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </>
              )}

              {/* Sort by */}
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t.specialists.sortBy}</label>
              <div className="space-y-1.5 mb-4">
                {(['topRated', 'mostAnswers', 'mostFollowers'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      sortBy === opt
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {opt === 'topRated' && <Star className="h-4 w-4" />}
                    {opt === 'mostAnswers' && <MessageSquare className="h-4 w-4" />}
                    {opt === 'mostFollowers' && <Users className="h-4 w-4" />}
                    {t.specialists[`sort${opt.charAt(0).toUpperCase() + opt.slice(1)}` as keyof typeof t.specialists] as string}
                  </button>
                ))}
              </div>

              {/* Online only checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={(e) => setOnlineOnly(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded-md border-2 border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all flex items-center justify-center">
                    {onlineOnly && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
                  <CircleDot className="h-3.5 w-3.5 text-green-500" />
                  {t.specialists.onlineNow}
                </span>
              </label>

              <button
                onClick={clearFilters}
                className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                {t.specialists.clearFilters}
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500">
                <span className="font-bold text-neutral-900">{filtered.length}</span> {t.specialists.results}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200">
                <Search className="h-10 w-10 text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-400">{t.specialists.noResults}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                  {filtered.map((sp) => {
                    const isFollowed = followed.has(sp.id);
                    return (
                      <div
                        key={sp.id}
                        className="group bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-200"
                      >
                        {/* Top: avatar + name + badges */}
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={sp.avatar}
                              alt={sp.name}
                              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-primary-100"
                            />
                            {sp.online && (
                              <span className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Verified badge + name */}
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-bold text-neutral-900 text-base truncate">{sp.name}</h3>
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 ring-1 ring-primary-200">
                                <BadgeCheck className="h-3 w-3" />
                                {t.specialists.verified}
                              </span>
                            </div>
                            <p className="text-sm text-primary-600 font-medium">{sp.subSpecialty}</p>

                            {/* Badges */}
                            {sp.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {sp.badges.map((b) => {
                                  const cfg = BADGE_CONFIG[b];
                                  if (!cfg) return null;
                                  const Icon = cfg.icon;
                                  return (
                                    <span key={b} className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                                      <Icon className="h-3 w-3" />
                                      {t.specialists[cfg.label as keyof typeof t.specialists] as string}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bio + credentials */}
                        <p className="mt-3 text-sm text-neutral-500 leading-relaxed line-clamp-2">{sp.bio}</p>
                        <p className="mt-1.5 text-xs font-medium text-neutral-400">{sp.credentials}</p>

                        {/* Stats row */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-neutral-50 py-2.5 text-center border border-neutral-100">
                            <p className="text-sm font-bold text-neutral-900">{formatStat(sp.reputation)}</p>
                            <p className="text-[10px] font-medium text-neutral-400 mt-0.5">{t.specialists.reputation}</p>
                          </div>
                          <div className="rounded-xl bg-neutral-50 py-2.5 text-center border border-neutral-100">
                            <p className="text-sm font-bold text-neutral-900">{sp.followers.toLocaleString()}</p>
                            <p className="text-[10px] font-medium text-neutral-400 mt-0.5">{t.specialists.followers}</p>
                          </div>
                          <div className="rounded-xl bg-neutral-50 py-2.5 text-center border border-neutral-100">
                            <p className="text-sm font-bold text-neutral-900">{sp.answers.toLocaleString()}</p>
                            <p className="text-[10px] font-medium text-neutral-400 mt-0.5">{t.specialists.answers}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-lg font-bold text-primary-700">{formatPrice(sp.priceUSD)}</span>
                          <span className="text-xs text-neutral-400">{t.specialists.perMonth}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => toggleFollow(sp.id)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                              isFollowed
                                ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              {isFollowed ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                              {isFollowed ? t.specialists.following : t.specialists.follow}
                            </span>
                          </button>
                          <button
                            onClick={(e) => e.preventDefault()}
                            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {t.specialists.bookSession}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Verification banner */}
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-neutral-100 to-primary-50/50 border border-neutral-200 p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 ring-1 ring-primary-200">
                      <Shield className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-neutral-900">{t.specialists.areYouDoctor}</h3>
                      <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{t.specialists.areYouDoctorDesc}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('verification')}
                      className="flex-shrink-0 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                    >
                      {t.specialists.applyForVerification}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
