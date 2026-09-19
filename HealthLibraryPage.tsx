import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Heart,
  Sparkles,
  TrendingUp,
  Pin,
  Zap,
  BookOpen,
  Newspaper,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type ContentType = 'all' | 'article' | 'news' | 'tip';
type Specialty = 'all' | 'mental' | 'pediatrics' | 'cardio' | 'immunity' | 'chronic' | 'elderly' | 'nutrition' | 'dermatology' | 'sexology';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  type: 'article' | 'news' | 'tip';
  specialty: Exclude<Specialty, 'all'>;
  author: string;
  authorAvatar: string;
  publishedAgo: string;
  image: string;
  isAI: boolean;
  views: number;
  comments: number;
  engagements: number;
  boosted: boolean;
  pinned: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'كيف تتعامل مع نوبات القلق في moments حرجة؟ دليل الأخصائي النفسي',
    excerpt: 'نوبات القلق قد تصيب أي شخص في أي وقت. نستعرض هنا تقنيات التنفس العميق، التأريض الحسي، وإعادة الهيكلة المعرفية التي يستخدمها المعالجون النفسيون لمساعدة المرضى.',
    type: 'article',
    specialty: 'mental',
    author: 'د. سارة المنصوري',
    authorAvatar: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '12 س',
    image: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 18700,
    comments: 312,
    engagements: 2140,
    boosted: false,
    pinned: true,
  },
  {
    id: 'a2',
    title: 'أحدث الأبحاث: نظام غذائي متوسطي يقلل خطر أمراض القلب بنسبة 30%',
    excerpt: 'دراسة جديدة شملت أكثر من 25 ألف مشارك تؤكد أن الالتزام بالنظام الغذائي المتوسطي يقلل بشكل كبير من مخاطر الأمراض القلبية الوعائية.',
    type: 'news',
    specialty: 'cardio',
    author: 'د. خالد العبدالله',
    authorAvatar: 'https://images.pexels.com/photos/8770725/pexels-photo-8770725.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '5 س',
    image: 'https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: true,
    views: 9430,
    comments: 87,
    engagements: 1205,
    boosted: true,
    pinned: false,
  },
  {
    id: 'a3',
    title: '5 علامات تحذيرية لتأخر النطق عند الأطفال يجب الانتباه لها',
    excerpt: 'التطور اللغوي يختلف من طفل لآخر، لكن هناك علامات محددة تشير إلى الحاجة لتقييم متخصص. تعرف على متى تطلب المساعدة المهنية.',
    type: 'tip',
    specialty: 'pediatrics',
    author: 'د. ليلى أحمد',
    authorAvatar: 'https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '18 س',
    image: 'https://images.pexels.com/photos/5452229/pexels-photo-5452229.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 25600,
    comments: 430,
    engagements: 3890,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a4',
    title: 'الحساسية الموسمية: من التشخيص إلى العلاج المناعي الحديث',
    excerpt: 'مع تغير الفصول تزداد شكاوى الحساسية. نشرح أحدث أساليب العلاج المناعي وكيفية التمييز بين الحساسية الموسمية والتهاب الأنف المزمن.',
    type: 'article',
    specialty: 'immunity',
    author: 'د. محمد الراشد',
    authorAvatar: 'https://images.pexels.com/photos/8413090/pexels-photo-8413090.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '2 ي',
    image: 'https://images.pexels.com/photos/7722791/pexels-photo-7722791.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: true,
    views: 7820,
    comments: 156,
    engagements: 980,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a5',
    title: 'السكري من النوع الثاني: استراتيجيات إدارة المرض لكبار السن',
    excerpt: 'إدارة السكري تتطلب نهجاً مخصصاً لكبار السن. نستعرض أهمية المراقبة المستمرة، التعديلات الغذائية، ومتى يجب تعديل جرعات الدواء.',
    type: 'article',
    specialty: 'chronic',
    author: 'د. فاطمة الزهراء',
    authorAvatar: 'https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '1 ي',
    image: 'https://images.pexels.com/photos/5407218/pexels-photo-5407218.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 12300,
    comments: 245,
    engagements: 1670,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a6',
    title: 'صحة كبار السن: 7 فحوصات دورية لا غنى عنها بعد الستين',
    excerpt: 'الوقاية خير من العلاج، خاصة في سن متقدمة. قائمة بالفحوصات الطبية الأساسية التي يجب إجراؤها بانتظام للحفاظ على جودة الحياة.',
    type: 'tip',
    specialty: 'elderly',
    author: 'د. عمر الحسن',
    authorAvatar: 'https://images.pexels.com/photos/8770725/pexels-photo-8770725.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '3 ي',
    image: 'https://images.pexels.com/photos/7723509/pexels-photo-7723509.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 15600,
    comments: 198,
    engagements: 2240,
    boosted: true,
    pinned: false,
  },
  {
    id: 'a7',
    title: 'التغذية العلاجية: كيف تساعد الأطعمة المضادة للالتهاب؟',
    excerpt: 'الالتهاب المزمن مرتبط بالعديد من الأمراض. تعرف على الأطعمة التي تساعد في مكافحته وكيفية دمجها في نظامك الغذائي اليومي.',
    type: 'article',
    specialty: 'nutrition',
    author: 'د. سارة المنصوري',
    authorAvatar: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '6 س',
    image: 'https://images.pexels.com/photos/5452229/pexels-photo-5452229.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: true,
    views: 8900,
    comments: 134,
    engagements: 1120,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a8',
    title: 'حب الشباب البالغين: أسبابه وعلاجاته المتقدمة',
    excerpt: 'حب الشباب لا يقتصر على المراهقين. نستعرض أسباب ظهوره لدى البالغين وأحدث الخيارات العلاجية من الموضعية إلى الليزر.',
    type: 'tip',
    specialty: 'dermatology',
    author: 'د. ليلى أحمد',
    authorAvatar: 'https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '8 س',
    image: 'https://images.pexels.com/photos/7089024/pexels-photo-7089024.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 20100,
    comments: 367,
    engagements: 2980,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a9',
    title: 'الصحة النفسية والعلاقات: التواصل الفعال في العلاقات الزوجية',
    excerpt: 'التواصل الجيد أساس العلاقات الصحية. مقال يستند إلى مبادئ العلاج الأسري مع ضوابط أخلاقية ومهنية دقيقة.',
    type: 'article',
    specialty: 'sexology',
    author: 'د. خالد العبدالله',
    authorAvatar: 'https://images.pexels.com/photos/8770725/pexels-photo-8770725.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '14 س',
    image: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 14200,
    comments: 289,
    engagements: 1890,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a10',
    title: 'الاكتئاب الموسمي: عندما يتحول الشتاء إلى عبء نفسي',
    excerpt: 'الاكتئاب الموسمي اضطراب حقيقي يؤثر على الملايين. نشرح الأعراض، خيارات العلاج بالضوء، ومتى تطلب المساعدة المتخصصة.',
    type: 'news',
    specialty: 'mental',
    author: 'د. فاطمة الزهراء',
    authorAvatar: 'https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '10 س',
    image: 'https://images.pexels.com/photos/7723509/pexels-photo-7723509.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: true,
    views: 11200,
    comments: 201,
    engagements: 1450,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a11',
    title: 'فحص القلب للرياضيين: لماذا هو ضراري قبل التمارين المكثفة؟',
    excerpt: 'النشاط البدني مفيد للقلب، لكن الرياضة المكثفة تتطلب فحصاً مسبقاً. نوضح الفحوصات اللازمة وكيفية الوقاية من المضاعفات.',
    type: 'tip',
    specialty: 'cardio',
    author: 'د. عمر الحسن',
    authorAvatar: 'https://images.pexels.com/photos/8770725/pexels-photo-8770725.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '20 س',
    image: 'https://images.pexels.com/photos/7089013/pexels-photo-7089013.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 6700,
    comments: 92,
    engagements: 730,
    boosted: false,
    pinned: false,
  },
  {
    id: 'a12',
    title: 'نظام غذائي لكبار السن: احتياجات تتغير مع العمر',
    excerpt: 'مع التقدم في العمر تتغير الاحتياجات الغذائية. دليل شامل للعناصر الأساسية التي يجب مراعاتها في تغذية المسنين.',
    type: 'article',
    specialty: 'nutrition',
    author: 'د. سارة المنصوري',
    authorAvatar: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&h=120&w=120&fit=crop',
    publishedAgo: '1 ي',
    image: 'https://images.pexels.com/photos/5452206/pexels-photo-5452206.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    isAI: false,
    views: 9800,
    comments: 145,
    engagements: 1080,
    boosted: false,
    pinned: false,
  },
];

const CONTENT_TYPES: { key: ContentType; icon: typeof BookOpen }[] = [
  { key: 'all', icon: BookOpen },
  { key: 'article', icon: BookOpen },
  { key: 'news', icon: Newspaper },
  { key: 'tip', icon: Lightbulb },
];

const SPECIALTIES: Specialty[] = [
  'all', 'mental', 'pediatrics', 'cardio', 'immunity', 'chronic', 'elderly', 'nutrition', 'dermatology', 'sexology',
];

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

export function HealthLibraryPage({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { t, direction } = useApp();
  const [typeFilter, setTypeFilter] = useState<ContentType>('all');
  const [specFilter, setSpecFilter] = useState<Specialty>('all');
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [showAdmin, setShowAdmin] = useState(false);

  const filtered = useMemo(() => {
    const result = articles.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (specFilter !== 'all' && a.specialty !== specFilter) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      return 0;
    });
  }, [articles, typeFilter, specFilter]);

  const handleBoost = (id: string) => {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, boosted: !a.boosted, views: a.boosted ? a.views : a.views + 5000 } : a));
  };

  const handlePin = (id: string) => {
    setArticles((prev) => prev.map((a) => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const typeLabel = (key: ContentType): string => {
    const map: Record<ContentType, string> = {
      all: t.library.filterAllTypes,
      article: t.library.filterArticle,
      news: t.library.filterNews,
      tip: t.library.filterTip,
    };
    return map[key];
  };

  const specLabel = (key: Specialty): string => {
    const map: Record<Specialty, string> = {
      all: t.library.filterAllSpecialties,
      mental: t.library.specMental,
      pediatrics: t.library.specPediatrics,
      cardio: t.library.specCardio,
      immunity: t.library.specImmunity,
      chronic: t.library.specChronic,
      elderly: t.library.specElderly,
      nutrition: t.library.specNutrition,
      dermatology: t.library.specDermatology,
      sexology: t.library.specSexology,
    };
    return map[key];
  };

  return (
    <div className="min-h-screen bg-neutral-50" dir={direction}>
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="container-x relative py-12 lg:py-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white mb-6"
          >
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            {t.nav.home}
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {t.library.title}
              </h1>
              <p className="mt-2 text-base text-white/70 max-w-2xl">
                {t.library.subtitle}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 lg:gap-8">
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-emerald-300">350K+</p>
                <p className="text-[11px] font-medium text-white/60 mt-0.5">{t.library.statArticles}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-cyan-300">12K+</p>
                <p className="text-[11px] font-medium text-white/60 mt-0.5">{t.library.statAuthors}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-teal-300">1.2M+</p>
                <p className="text-[11px] font-medium text-white/60 mt-0.5">{t.library.statReaders}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Double-layer filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="container-x py-3 space-y-2.5">
          {/* Row 1: Content type */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
            {CONTENT_TYPES.map((ct) => {
              const Icon = ct.icon;
              const active = typeFilter === ct.key;
              return (
                <button
                  key={ct.key}
                  onClick={() => setTypeFilter(ct.key)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {typeLabel(ct.key)}
                </button>
              );
            })}
          </div>

          {/* Row 2: Specialty */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
            {SPECIALTIES.map((sp) => {
              const active = specFilter === sp;
              return (
                <button
                  key={sp}
                  onClick={() => setSpecFilter(sp)}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {specLabel(sp)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin toggle */}
      <div className="container-x py-4">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-600 transition-all hover:bg-neutral-200"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {t.library.adminTitle}
        </button>
      </div>

      {/* Articles grid */}
      <div className="container-x pb-16">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-12 w-12 text-neutral-300 mb-4" />
            <p className="text-sm text-neutral-400">{t.library.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <article
                key={article.id}
                className="group bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-neutral-900/5 hover:border-neutral-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* AI badge */}
                  {article.isAI && (
                    <div className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 ring-2 ring-white/30">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  {/* Pinned indicator */}
                  {article.pinned && (
                    <div className="absolute top-3 start-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                      <Pin className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {/* Boosted indicator */}
                  {article.boosted && (
                    <div className="absolute bottom-3 start-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                      <Zap className="h-3 w-3" />
                      {t.library.adminBoosted}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
                      {specLabel(article.specialty)}
                    </span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                      {typeLabel(article.type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-900 leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2.5 mb-3 mt-auto">
                    <img
                      src={article.authorAvatar}
                      alt={article.author}
                      loading="lazy"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-700 truncate">{article.author}</p>
                      <p className="text-[10px] text-neutral-400">{t.library.ago} {article.publishedAgo}</p>
                    </div>
                  </div>

                  {/* Admin controls */}
                  {showAdmin && (
                    <div className="flex gap-2 mb-3 pb-3 border-b border-neutral-100">
                      <button
                        onClick={() => handleBoost(article.id)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          article.boosted
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        <Zap className="h-3 w-3" />
                        {article.boosted ? t.library.adminBoosted : t.library.adminBoost}
                      </button>
                      <button
                        onClick={() => handlePin(article.id)}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          article.pinned
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-neutral-100 text-neutral-500 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <Pin className="h-3 w-3" />
                        {article.pinned ? t.library.adminPinned : t.library.adminPin}
                      </button>
                    </div>
                  )}

                  {/* Engagement metrics */}
                  <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Eye className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-bold text-neutral-700">{formatNum(article.views)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <MessageCircle className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-bold text-neutral-700">{formatNum(article.comments)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Heart className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-bold text-neutral-700">{formatNum(article.engagements)}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
