import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Headphones,
  Video,
  Eye,
  Clock,
  Shield,
  Activity,
  TrendingUp,
  Mic,
  Heart,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type Tab = 'reels' | 'audio';

interface Reel {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  duration: string;
  views: number;
  category: 'surgical' | 'awareness';
  protected: boolean;
  ago: string;
}

interface AudioRec {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  duration: string;
  views: number;
  specialty: string;
  ago: string;
}

const REELS: Reel[] = [
  { id: 'r1', title: 'استئصال المرارة بالمنظار - شرح كامل', author: 'د. أحمد السالم', authorAvatar: 'https://images.pexels.com/photos/8376307/pexels-photo-8376307.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/24193881/pexels-photo-24193881.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '4:32', views: 125400, category: 'surgical', protected: true, ago: '2 ي' },
  { id: 'r2', title: 'تنظير الركبة - إصابة الغضروف المينيسكي', author: 'د. ماجد الشمري', authorAvatar: 'https://images.pexels.com/photos/5234501/pexels-photo-5234501.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '6:15', views: 89200, category: 'surgical', protected: true, ago: '5 ي' },
  { id: 'r3', title: 'الوقاية من السكري - 10 نصائح ذهبية', author: 'د. سارة المنصوري', authorAvatar: 'https://images.pexels.com/photos/8460084/pexels-photo-8460084.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/33892295/pexels-photo-33892295.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '3:48', views: 234100, category: 'awareness', protected: true, ago: '1 ي' },
  { id: 'r4', title: 'عملية القلب المفتوح - رحلة داخل غرفة العمليات', author: 'د. خالد العبدالله', authorAvatar: 'https://images.pexels.com/photos/20100299/pexels-photo-20100299.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/6291179/pexels-photo-6291179.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '8:22', views: 456700, category: 'surgical', protected: true, ago: '8 ي' },
  { id: 'r5', title: 'كيف تفحص ضغط دمك في المنزل بشكل صحيح', author: 'د. ليلى أحمد', authorAvatar: 'https://images.pexels.com/photos/5867700/pexels-photo-5867700.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/30348333/pexels-photo-30348333.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '2:54', views: 178300, category: 'awareness', protected: true, ago: '3 ي' },
  { id: 'r6', title: 'جراحة الدماغ - استئصال ورم دماغي', author: 'د. عمر الحسن', authorAvatar: 'https://images.pexels.com/photos/20100296/pexels-photo-20100296.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/33916249/pexels-photo-33916249.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '11:07', views: 567800, category: 'surgical', protected: true, ago: '12 ي' },
  { id: 'r7', title: 'التوعية بسرطان الثدي - الفحص المبكر ينقذ الأرواح', author: 'د. فاطمة الزهراء', authorAvatar: 'https://images.pexels.com/photos/8376307/pexels-photo-8376307.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/6291290/pexels-photo-6291290.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '5:19', views: 342000, category: 'awareness', protected: true, ago: '6 ي' },
  { id: 'r8', title: 'عملية تجميل الأنف - تقنية مغلقة', author: 'د. ماجد الشمري', authorAvatar: 'https://images.pexels.com/photos/5234501/pexels-photo-5234501.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/11674664/pexels-photo-11674664.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '7:41', views: 298500, category: 'surgical', protected: true, ago: '9 ي' },
  { id: 'r9', title: 'الحقن المجهري - كل ما تحتاج معرفته', author: 'د. سارة المنصوري', authorAvatar: 'https://images.pexels.com/photos/8460084/pexels-photo-8460084.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/24193881/pexels-photo-24193881.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '4:05', views: 156900, category: 'awareness', protected: true, ago: '4 ي' },
  { id: 'r10', title: 'جراحة الساد (المياه البيضاء) - أحدث تقنية', author: 'د. خالد العبدالله', authorAvatar: 'https://images.pexels.com/photos/20100299/pexels-photo-20100299.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '5:33', views: 201400, category: 'surgical', protected: true, ago: '7 ي' },
  { id: 'r11', title: 'الصحة النفسية للأطفال - متى نطلب المساعدة', author: 'د. ليلى أحمد', authorAvatar: 'https://images.pexels.com/photos/5867700/pexels-photo-5867700.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/33892295/pexels-photo-33892295.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '6:02', views: 134700, category: 'awareness', protected: true, ago: '10 ي' },
  { id: 'r12', title: 'استئصال الزائدة الدودية بالمنظار', author: 'د. أحمد السالم', authorAvatar: 'https://images.pexels.com/photos/8376307/pexels-photo-8376307.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', thumbnail: 'https://images.pexels.com/photos/6291179/pexels-photo-6291179.jpeg?auto=compress&cs=tinysrgb&h=600&w=400', duration: '3:27', views: 98300, category: 'surgical', protected: true, ago: '11 ي' },
];

const AUDIO: AudioRec[] = [
  { id: 'a1', title: 'إدارة التوتر والقلق - جلسة استماع علاجية', author: 'د. سارة المنصوري', authorAvatar: 'https://images.pexels.com/photos/8376307/pexels-photo-8376307.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '24', views: 45200, specialty: 'الصحة النفسية', ago: '3 ي' },
  { id: 'a2', title: 'تغذية الأم الحامل - ما تأكل وما تتجنب', author: 'د. فاطمة الزهراء', authorAvatar: 'https://images.pexels.com/photos/8460084/pexels-photo-8460084.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '18', views: 67800, specialty: 'التغذية', ago: '5 ي' },
  { id: 'a3', title: 'فهم النوبات القلبية - الأعراض والاستجابة', author: 'د. خالد العبدالله', authorAvatar: 'https://images.pexels.com/photos/20100299/pexels-photo-20100299.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '15', views: 89400, specialty: 'القلب', ago: '2 ي' },
  { id: 'a4', title: 'تطور اللغة عند الأطفال - الدليل الكامل', author: 'د. ليلى أحمد', authorAvatar: 'https://images.pexels.com/photos/5867700/pexels-photo-5867700.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '32', views: 34100, specialty: 'طب الأطفال', ago: '7 ي' },
  { id: 'a5', title: 'التعامل مع آلام الظهر المزمنة', author: 'د. ماجد الشمري', authorAvatar: 'https://images.pexels.com/photos/5234501/pexels-photo-5234501.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '21', views: 52300, specialty: 'العظام', ago: '4 ي' },
  { id: 'a6', title: 'اضطرابات النوم - الأسباب والحلول', author: 'د. عمر الحسن', authorAvatar: 'https://images.pexels.com/photos/20100296/pexels-photo-20100296.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop', duration: '27', views: 71500, specialty: 'الأعصاب', ago: '6 ي' },
];

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function MediaReelsPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { t, direction } = useApp();
  const [tab, setTab] = useState<Tab>('reels');
  const [catFilter, setCatFilter] = useState<'all' | 'surgical' | 'awareness'>('all');

  const filteredReels = useMemo(() => {
    if (catFilter === 'all') return REELS;
    return REELS.filter((r) => r.category === catFilter);
  }, [catFilter]);

  const totalReelViews = REELS.reduce((sum, r) => sum + r.views, 0);
  const totalAudioViews = AUDIO.reduce((sum, a) => sum + a.views, 0);

  return (
    <div className="min-h-screen bg-neutral-50" dir={direction}>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-rose-900 to-pink-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="container-x relative py-12 lg:py-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white mb-6">
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            {t.reels.backToHome}
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-500/30">
              <Video className="h-6 w-6" />
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">{t.reels.title}</h1>
          </div>
          <p className="text-sm lg:text-base text-white/70 max-w-2xl">{t.reels.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container-x py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('reels')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                tab === 'reels' ? 'bg-rose-700 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Video className="h-4 w-4" />
              {t.reels.tabReels}
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{formatNum(REELS.length)}</span>
            </button>
            <button
              onClick={() => setTab('audio')}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                tab === 'audio' ? 'bg-rose-700 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Headphones className="h-4 w-4" />
              {t.reels.tabAudio}
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{formatNum(AUDIO.length)}</span>
            </button>
          </div>

          {/* Sub-filter for reels */}
          {tab === 'reels' && (
            <div className="flex items-center gap-2 mt-3">
              {(['all', 'surgical', 'awareness'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    catFilter === c ? 'bg-rose-700 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {c === 'all' ? t.dictionary.catAll : c === 'surgical' ? t.reels.surgicalOps : t.reels.awareness}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-x py-8">
        {tab === 'reels' ? (
          /* Reels grid - portrait cards matching article card design */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {filteredReels.map((reel) => (
              <article
                key={reel.id}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-neutral-900/5 hover:border-neutral-300 flex flex-col"
              >
                {/* Portrait thumbnail */}
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                      <Play className="h-6 w-6 text-rose-600 ms-1" />
                    </div>
                  </div>

                  {/* Protected badge */}
                  {reel.protected && (
                    <div className="absolute top-2.5 end-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md ring-2 ring-white/30">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-2.5 start-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm"
                    style={{ background: reel.category === 'surgical' ? 'rgba(225,29,72,0.85)' : 'rgba(6,182,212,0.85)' }}>
                    {reel.category === 'surgical' ? t.reels.surgicalOps : t.reels.awareness}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 end-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {reel.duration}
                  </div>

                  {/* Bottom info on image */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1.5">{reel.title}</h3>
                    <div className="flex items-center gap-2">
                      <img src={reel.authorAvatar} alt={reel.author} loading="lazy" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/40" />
                      <span className="text-[10px] text-white/80 truncate">{reel.author}</span>
                    </div>
                  </div>
                </div>

                {/* Footer bar - matching article card engagement metrics */}
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-neutral-100">
                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-bold text-neutral-700">{formatNum(reel.views)}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">{t.reels.by} {reel.ago}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Audio recordings grid - matching article card design */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AUDIO.map((rec) => (
              <article
                key={rec.id}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 transition-all hover:shadow-lg hover:shadow-neutral-900/5 hover:border-rose-200 flex flex-col"
              >
                {/* Top: avatar + play */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <img src={rec.authorAvatar} alt={rec.author} loading="lazy" className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-100" />
                    <div className="absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md ring-2 ring-white">
                      <Mic className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{rec.author}</p>
                    <p className="text-[10px] text-neutral-400">{rec.specialty}</p>
                  </div>
                  <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-all group-hover:bg-rose-500 group-hover:text-white active:scale-95">
                    <Play className="h-5 w-5 ms-0.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-neutral-900 leading-snug mb-2 line-clamp-2">{rec.title}</h3>

                {/* Audio waveform mock */}
                <div className="flex items-center gap-0.5 h-10 mb-4">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const h = 20 + Math.sin(i * 0.5) * 15 + Math.cos(i * 0.3) * 10 + (i % 3) * 5;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-full bg-rose-200 transition-colors group-hover:bg-rose-400"
                        style={{ height: `${Math.max(8, Math.min(100, h))}%` }}
                      />
                    );
                  })}
                </div>

                {/* Footer bar - matching article card metrics */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-bold text-neutral-700">{formatNum(rec.views)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-bold text-neutral-700">{rec.duration} {t.reels.duration_min}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">{rec.ago}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Bottom stats bar */}
      <div className="border-t border-neutral-200 bg-white">
        <div className="container-x py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{formatNum(REELS.length)}</p>
                <p className="text-[11px] text-neutral-400">{t.reels.totalVideos}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{formatNum(AUDIO.length)}</p>
                <p className="text-[11px] text-neutral-400">{t.reels.totalAudio}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">{formatNum(totalReelViews + totalAudioViews)}</p>
                <p className="text-[11px] text-neutral-400">{t.reels.totalViews}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-neutral-900">8+</p>
                <p className="text-[11px] text-neutral-400">{t.reels.specialistContrib}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
