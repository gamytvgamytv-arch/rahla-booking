import { useEffect, useState } from 'react';
import {
  Stethoscope, HeartPulse, ShieldPlus, Baby, Flower2, Smile,
  Eye, Brain, Activity, Bone, Ear, ArrowLeft, Search, MessageCircle,
  Users, FileText, Star, Clock, TrendingUp, Video, Headphones,
  BookOpen, GraduationCap, Droplet, Syringe, Ambulance, Radiation
} from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Specialty, type Doctor, type Question, type Article, type DoctorVideo, type Course } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';
import QuestionCard from '@/components/QuestionCard';
import ArticleCard from '@/components/ArticleCard';

const iconMap: Record<string, typeof Stethoscope> = {
  'heart-pulse': HeartPulse,
  'shield-plus': ShieldPlus,
  'baby': Baby,
  'flower-2': Flower2,
  'smile': Smile,
  'eye': Eye,
  'brain': Brain,
  'activity': Activity,
  'bone': Bone,
  'ear': Ear,
  'stethoscope': Stethoscope,
  'droplet': Droplet,
  'syringe': Syringe,
  'shield': ShieldPlus,
  'ambulance': Ambulance,
  'radiation': Radiation,
};

export default function HomePage() {
  const { navigate } = useRouter();
  const { t, lang, specialtyName } = useI18n();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: specs }, { data: docs }, { data: qs }, { data: arts }, { data: vids }, { data: crs }] = await Promise.all([
        supabase.from('specialties').select('*').order('name'),
        supabase.from('doctors').select('*, specialty(*)').order('rating', { ascending: false }).limit(4),
        supabase.from('questions').select('*, specialty(*), answers(*)').order('created_at', { ascending: false }).limit(4),
        supabase.from('articles').select('*, specialty(*), doctor(*)').order('created_at', { ascending: false }).limit(3),
        supabase.from('doctor_videos').select('*, doctor(*), specialty(*)').order('views', { ascending: false }).limit(3),
        supabase.from('courses').select('*, specialty(*), doctor(*)').eq('is_published', true).order('enrolled_count', { ascending: false }).limit(3),
      ]);
      setSpecialties(specs || []);
      setDoctors(docs || []);
      setQuestions(qs || []);
      setArticles(arts || []);
      setVideos(vids || []);
      setCourses(crs || []);
      setLoading(false);
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    { icon: Users, label: t('stats.doctors'), value: '+18,700' },
    { icon: MessageCircle, label: t('stats.consultations'), value: '+37,000' },
    { icon: FileText, label: t('stats.articles'), value: '+350,000' },
    { icon: HeartPulse, label: t('stats.specialties'), value: '+25' },
  ];

  const services = [
    { icon: Video, title: t('sessions.video_paid'), desc: t('sessions.video_paid_desc'), path: '/sessions', color: 'teal' },
    { icon: MessageCircle, title: t('sessions.free_text'), desc: t('sessions.free_text_desc'), path: '/sessions', color: 'green' },
    { icon: BookOpen, title: t('courses.title'), desc: t('courses.subtitle'), path: '/courses', color: 'amber' },
    { icon: Headphones, title: t('audio.title'), desc: t('audio.subtitle'), path: '/audio', color: 'blue' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-br from-teal-50 via-white to-teal-50/50">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, #0d9488 1px, transparent 1px), radial-gradient(circle at 80% 70%, #0d9488 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right animate-fade-in">
              <span className="badge bg-teal-100 text-teal-700 mb-4">{lang === 'ar' ? 'منصة طبية موثوقة' : lang === 'en' ? 'Trusted Medical Platform' : lang === 'de' ? 'Vertrauenswürdige Plattform' : 'Надёжная платформа'}</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight mb-6">
                {t('hero.title').split(' ').slice(0, 3).join(' ')}
                <span className="text-teal-600"> {t('hero.title').split(' ').slice(3).join(' ')}</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto lg:mx-0 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.search_placeholder')}
                    className="w-full pr-12 pl-4 py-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all bg-white shadow-sm"
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">{t('common.search')}</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button onClick={() => navigate('/ask')} className="btn-primary flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {t('hero.ask_now')}
                </button>
                <button onClick={() => navigate('/doctors')} className="btn-secondary flex items-center gap-2">
                  {t('hero.browse_doctors')}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-scale-in">
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 opacity-10 absolute -top-8 -right-8" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-80">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">
                      <Stethoscope className="w-7 h-7 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{lang === 'ar' ? 'استشارة فورية' : 'Instant Consultation'}</p>
                      <p className="text-sm text-gray-500">{lang === 'ar' ? 'رد خلال ساعات' : 'Response within hours'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: HeartPulse, text: lang === 'ar' ? 'أمراض القلب' : 'Cardiology' },
                      { icon: Baby, text: lang === 'ar' ? 'طب الأطفال' : 'Pediatrics' },
                      { icon: Brain, text: lang === 'ar' ? 'الطب النفسي' : 'Psychiatry' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-gray-700 font-medium text-sm">{item.text}</span>
                        <ArrowLeft className="w-4 h-4 text-gray-300 mr-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-3">
                  <stat.icon className="w-7 h-7 text-teal-600" />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">{t('sessions.title')}</h2>
            <p className="text-gray-500">{t('sessions.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <button key={i} onClick={() => navigate(service.path)} className="card card-hover p-6 text-right group">
                <div className={`w-14 h-14 rounded-2xl bg-${service.color}-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <service.icon className={`w-7 h-7 text-${service.color}-600`} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-gradient-to-b from-teal-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-title mb-2">{t('specialties.title')}</h2>
            <p className="text-gray-500">{t('specialties.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 mx-auto mb-3" />
                  <div className="h-4 bg-gray-100 rounded mx-auto w-20" />
                </div>
              ))
            ) : (
              specialties.map((spec) => {
                const Icon = iconMap[spec.icon] || Stethoscope;
                return (
                  <button
                    key={spec.id}
                    onClick={() => navigate(`/doctors?specialty=${spec.slug}`)}
                    className="card card-hover p-6 flex flex-col items-center text-center group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-3 group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                      <Icon className="w-7 h-7 text-teal-600" />
                    </div>
                    <span className="font-semibold text-gray-700 text-sm group-hover:text-teal-600 transition-colors">
                      {specialtyName(spec)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('doctors.featured')}</h2>
              <p className="text-gray-500">{t('doctors.featured_sub')}</p>
            </div>
            <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 mx-auto mb-4" />
                  <div className="h-5 bg-gray-100 rounded mx-auto w-32 mb-2" />
                  <div className="h-4 bg-gray-100 rounded mx-auto w-24" />
                </div>
              ))
            ) : (
              doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)
            )}
          </div>
        </div>
      </section>

      {/* Recent Q&A */}
      <section className="py-16 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('questions.title')}</h2>
              <p className="text-gray-500">{t('questions.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/questions')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            ) : (
              questions.map((q) => <QuestionCard key={q.id} question={q} />)
            )}
          </div>
        </div>
      </section>

      {/* Videos */}
      {videos.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t('videos.title')}</h2>
                <p className="text-gray-500">{t('videos.subtitle')}</p>
              </div>
              <button onClick={() => navigate('/videos')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
                {t('doctors.view_all')}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <button key={vid.id} onClick={() => navigate('/videos')} className="card card-hover overflow-hidden text-right group">
                  <div className="relative h-44 bg-gradient-to-br from-teal-100 to-teal-50 overflow-hidden">
                    {vid.thumbnail_url && (
                      <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6 text-teal-600" />
                      </div>
                    </div>
                    {vid.specialty && <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-teal-700 shadow-sm">{specialtyName(vid.specialty)}</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">{vid.title}</h3>
                    {vid.doctor && <p className="text-sm text-teal-600">{vid.doctor.name}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-teal-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="section-title mb-2">{t('courses.title')}</h2>
                <p className="text-gray-500">{t('courses.subtitle')}</p>
              </div>
              <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
                {t('doctors.view_all')}
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <button key={course.id} onClick={() => navigate('/courses')} className="card card-hover overflow-hidden text-right group flex flex-col">
                  <div className="relative h-36 bg-gradient-to-br from-amber-100 to-amber-50 overflow-hidden">
                    {course.image_url && <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <span className="absolute top-3 left-3 badge bg-amber-400 text-white shadow-sm"><GraduationCap className="w-3 h-3 ml-1" />{course.lessons_count} {t('courses.lessons')}</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <span className="text-xl font-bold text-teal-600">${course.price}</span>
                      <span className="text-xs text-gray-400">{course.enrolled_count} {t('courses.enrolled')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">{t('articles.title')}</h2>
              <p className="text-gray-500">{t('articles.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/articles')} className="flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all">
              {t('doctors.view_all')}
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              articles.map((art) => <ArticleCard key={art.id} article={art} />)
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="relative">
              <MessageCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t('questions.have_question')}
              </h2>
              <p className="text-teal-50 text-lg mb-8 max-w-xl mx-auto">
                {t('questions.ask_doctor')}
              </p>
              <button
                onClick={() => navigate('/ask')}
                className="bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.ask_now')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
