import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  BookMarked,
  Stethoscope,
  Brain,
  Heart,
  Baby,
  Shield,
  Activity,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type LangFilter = 'both' | 'ar' | 'en';
type CatFilter = 'all' | 'mental' | 'cardio' | 'pediatrics' | 'immunity' | 'chronic' | 'neuro' | 'dermatology' | 'general';

interface MedicalTerm {
  id: string;
  term_ar: string;
  term_en: string;
  definition_ar: string;
  category: Exclude<CatFilter, 'all'>;
  verified: boolean;
  relatedArticles: string[];
}

const TERMS: MedicalTerm[] = [
  { id: 't1', term_ar: 'ارتفاع ضغط الدم', term_en: 'Hypertension', definition_ar: 'حالة مزمنة يرتفع فيها ضغط الدم في الشرايين بشكل مستمر عن المستوى الطبيعي، مما يزيد خطر الإصابة بأمراض القلب والسكتة الدماغية.', category: 'cardio', verified: true, relatedArticles: ['أحدث الأبحاث: نظام غذائي متوسطي', 'فحص القلب للرياضيين'] },
  { id: 't2', term_ar: 'الاكتئاب السريري', term_en: 'Clinical Depression', definition_ar: 'اضطراب نفسي مزمن يتميز بمشاعر حزن عميق وفقدان الاهتمام بالأنشطة اليومية، يؤثر على النوم والشهية والتركيز.', category: 'mental', verified: true, relatedArticles: ['كيف تتعامل مع نوبات القلق', 'الاكتئاب الموسمي'] },
  { id: 't3', term_ar: 'الربو', term_en: 'Asthma', definition_ar: 'مرض التهابي مزمن يصيب الممرات الهوائية، يسبب نوبات متكررة من ضيق التنفس والصفير والسعال، ويختلف في شدة بين الأشخاص.', category: 'immunity', verified: true, relatedArticles: ['الحساسية الموسمية: من التشخيص إلى العلاج'] },
  { id: 't4', term_ar: 'التهاب السحايا', term_en: 'Meningitis', definition_ar: 'التهاب يصيب الأغشية المحيطة بالدماغ والحبل الشوكي، قد يكون فيروسي أو بكتيري، ويتطلب تدخلاً طبياً فورياً.', category: 'neuro', verified: true, relatedArticles: ['5 علامات تحذيرية لتأخر النطق'] },
  { id: 't5', term_ar: 'السكري من النوع الثاني', term_en: 'Type 2 Diabetes', definition_ar: 'اضطراب استقلابي مزمن يتميز بمقاومة الأنسولين وارتفاع مستوى السكر في الدم، يُدار بالنظام الغذائي والنشاط البدني والأدوية.', category: 'chronic', verified: true, relatedArticles: ['السكري من النوع الثاني: استراتيجيات إدارة المرض', 'نظام غذائي لكبار السن'] },
  { id: 't6', term_ar: 'الأكزيما', term_en: 'Eczema', definition_ar: 'حالة جلدية التهابية مزمنة تسبب جفاف وحكة واحمرار الجلد، قد تتفاقم بسبب مسببات الحساسية والإجهاد.', category: 'dermatology', verified: true, relatedArticles: ['حب الشباب البالغين'] },
  { id: 't7', term_ar: 'التوحد', term_en: 'Autism Spectrum Disorder', definition_ar: 'اضطراب في النمو العصبي يؤثر على التواصل والتفاعل الاجتماعي والسلوكيات، يظهر عادة في الطفولة المبكرة.', category: 'pediatrics', verified: true, relatedArticles: ['5 علامات تحذيرية لتأخر النطق'] },
  { id: 't8', term_ar: 'الذبحة الصدرية', term_en: 'Angina Pectoris', definition_ar: 'ألم أو ضغط في الصدر يحدث عندما لا يحصل عضلة القلب على كمية كافية من الدم المؤكسج، غالباً بسبب تضيق الشرايين التاجية.', category: 'cardio', verified: true, relatedArticles: ['أحدث الأبحاث: نظام غذائي متوسطي'] },
  { id: 't9', term_ar: 'القلق العام', term_en: 'Generalized Anxiety Disorder', definition_ar: 'اضطراب نفسي يتميز بالقلق المفرط والمستمر تجاه أمور مختلفة، يصاحبه أعراض جسدية مثل التوتر والإرهاق واضطراب النوم.', category: 'mental', verified: true, relatedArticles: ['كيف تتعامل مع نوبات القلق'] },
  { id: 't10', term_ar: 'فقر الدم', term_en: 'Anemia', definition_ar: 'حالة ينخفض فيها عدد كريات الدم الحمراء أو الهيموغلوبين، مما يقلل قدرة الدم على حمل الأكسجين، يسبب التعب والشحوب.', category: 'general', verified: true, relatedArticles: ['التغذية العلاجية: كيف تساعد الأطعمة المضادة للالتهاب'] },
  { id: 't11', term_ar: 'التهاب المفاصل الروماتويدي', term_en: 'Rheumatoid Arthritis', definition_ar: 'مرض مناعي ذاتي مزمن يسبب التهاب المفاصل وتورمها وألمها، قد يؤدي إلى تلف المفاصل إذا لم يُعالج مبكراً.', category: 'chronic', verified: true, relatedArticles: ['التغذية العلاجية'] },
  { id: 't12', term_ar: 'الصداع النصفي', term_en: 'Migraine', definition_ar: 'نوع من الصداع الشديد والمتكرر يصيب عادة جانباً واحداً من الرأس، قد يصاحبه غثيان وحساسية للضوء والصوت.', category: 'neuro', verified: true, relatedArticles: ['الاكتئاب الموسمي'] },
  { id: 't13', term_ar: 'الحصبة', term_en: 'Measles', definition_ar: 'مرض فيروسي معدٍ يصيب الأطفال أساساً، يتميز بالطفح الجلدي والحمى والسعال، يمكن الوقاية منه باللقاح.', category: 'pediatrics', verified: true, relatedArticles: ['5 علامات تحذيرية لتأخر النطق'] },
  { id: 't14', term_ar: 'قصور القلب', term_en: 'Heart Failure', definition_ar: 'حالة مزمنة لا يستطيع فيها القلب ضخ ما يكفي من الدم لتلبية احتياجات الجسم، يسبب ضيق التنفس والتعب وتورم الأطراف.', category: 'cardio', verified: true, relatedArticles: ['فحص القلب للرياضيين'] },
  { id: 't15', term_ar: 'الصدفية', term_en: 'Psoriasis', definition_ar: 'مرض جلدي مزمن مناعي يسبب ظهور بقع حمراء مغطاة بقشور فضية، يظهر عادة على فروة الرأس والمرفقين والركبتين.', category: 'dermatology', verified: true, relatedArticles: ['حب الشباب البالغين'] },
  { id: 't16', term_ar: 'المناعة الذاتية', term_en: 'Autoimmunity', definition_ar: 'حالة يهاجم فيها جهاز المناعة خلايا الجسم نفسه بالخطأ، مما يسبب التهابات وأضراراً لأنسجة وأعضاء مختلفة.', category: 'immunity', verified: true, relatedArticles: ['الحساسية الموسمية'] },
];

const CATEGORIES: { key: CatFilter; icon: typeof Stethoscope }[] = [
  { key: 'all', icon: Stethoscope },
  { key: 'mental', icon: Brain },
  { key: 'cardio', icon: Heart },
  { key: 'pediatrics', icon: Baby },
  { key: 'immunity', icon: Shield },
  { key: 'chronic', icon: Activity },
  { key: 'neuro', icon: Sparkles },
  { key: 'dermatology', icon: BookMarked },
  { key: 'general', icon: Stethoscope },
];

export function MedicalDictionaryPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { t, direction } = useApp();
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState<LangFilter>('both');
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [selected, setSelected] = useState<MedicalTerm | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((term) => {
      if (catFilter !== 'all' && term.category !== catFilter) return false;
      if (!q) return true;
      const ar = term.term_ar.toLowerCase();
      const en = term.term_en.toLowerCase();
      const def = term.definition_ar.toLowerCase();
      if (langFilter === 'ar') return ar.includes(q) || def.includes(q);
      if (langFilter === 'en') return en.includes(q);
      return ar.includes(q) || en.includes(q) || def.includes(q);
    });
  }, [query, langFilter, catFilter]);

  const catLabel = (key: CatFilter): string => {
    const map: Record<CatFilter, string> = {
      all: t.dictionary.catAll,
      mental: t.dictionary.catMental,
      cardio: t.dictionary.catCardio,
      pediatrics: t.dictionary.catPediatrics,
      immunity: t.dictionary.catImmunity,
      chronic: t.dictionary.catChronic,
      neuro: t.dictionary.catNeuro,
      dermatology: t.dictionary.catDermatology,
      general: t.dictionary.catGeneral,
    };
    return map[key];
  };

  return (
    <div className="min-h-screen bg-neutral-50" dir={direction}>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-teal-900 to-emerald-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 35%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
          backgroundSize: '55px 55px',
        }} />
        <div className="container-x relative py-12 lg:py-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white mb-6">
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            {t.dictionary.backToHome}
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-lg shadow-cyan-500/30">
              <BookMarked className="h-6 w-6" />
            </div>
            <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">{t.dictionary.title}</h1>
          </div>
          <p className="text-sm lg:text-base text-white/70 max-w-2xl">{t.dictionary.subtitle}</p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1.5 font-bold text-white backdrop-blur-sm">{formatNum(TERMS.length)} {t.dictionary.termCount}</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container-x py-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.dictionary.searchPlaceholder}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-11 pe-10 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 focus:outline-none"
              />
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-neutral-400" />
              {query && (
                <button onClick={() => setQuery('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-2">
            {(['both', 'ar', 'en'] as LangFilter[]).map((l) => (
              <button
                key={l}
                onClick={() => setLangFilter(l)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  langFilter === l ? 'bg-cyan-800 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {l === 'both' ? t.dictionary.langBoth : l === 'ar' ? t.dictionary.langAr : t.dictionary.langEn}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = catFilter === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCatFilter(c.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    active ? 'bg-cyan-800 text-white shadow-md' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {catLabel(c.key)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-x py-8">
        <p className="text-sm text-neutral-500 mb-5">{filtered.length} {t.dictionary.results}</p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="h-12 w-12 text-neutral-300 mb-4" />
            <p className="text-sm font-bold text-neutral-600">{t.dictionary.noResults}</p>
            <p className="text-xs text-neutral-400 mt-1">{t.dictionary.noResultsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelected(term)}
                className="group text-start bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 transition-all hover:shadow-lg hover:shadow-neutral-900/5 hover:border-cyan-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-neutral-900 leading-snug">{term.term_ar}</h3>
                    <p className="text-sm text-cyan-600 font-medium mt-0.5">{term.term_en}</p>
                  </div>
                  {term.verified && (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">{term.definition_ar}</p>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">{catLabel(term.category)}</span>
                  <span className="text-[10px] font-bold text-cyan-600 group-hover:text-cyan-700">{t.dictionary.readArticle}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Term detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-neutral-100 p-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{selected.term_ar}</h2>
                <p className="text-sm text-cyan-600 font-medium">{selected.term_en}</p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">{catLabel(selected.category)}</span>
                  {selected.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.dictionary.verifiedBy}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">{t.dictionary.definition}</h3>
                <p className="text-sm text-neutral-700 leading-relaxed">{selected.definition_ar}</p>
              </div>
              {selected.relatedArticles.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">{t.dictionary.relatedArticles}</h3>
                  <div className="space-y-2">
                    {selected.relatedArticles.map((article, i) => (
                      <button
                        key={i}
                        onClick={() => { onNavigate('library'); setSelected(null); }}
                        className="flex items-center justify-between gap-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-start transition-all hover:border-cyan-200 hover:bg-cyan-50/50"
                      >
                        <span className="text-sm font-medium text-neutral-700 flex-1">{article}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-cyan-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
