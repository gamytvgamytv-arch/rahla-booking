import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Video, Headphones, BookOpen,
  MessageSquare, DollarSign, AlertTriangle, Settings, LogOut,
  Plus, Trash2, Edit, Stethoscope, Eye, Shield, TrendingUp, X
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Question, type Article, type DoctorVideo, type DoctorAudio, type Course, type Payment, type AIViolation, type SiteSettings, type VideoSession, type TextSession, type Specialty } from '@/lib/supabase';

type AdminSection = 'overview' | 'doctors' | 'questions' | 'articles' | 'videos' | 'audio' | 'courses' | 'sessions' | 'payments' | 'violations' | 'settings';

export default function AdminPage() {
  const { t, specialtyName } = useI18n();
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<AdminSection>('overview');
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('');

  // Data states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [audios, setAudios] = useState<DoctorAudio[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [violations, setViolations] = useState<AIViolation[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [textSessions, setTextSessions] = useState<TextSession[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Add modal
  const [showAdd, setShowAdd] = useState<AdminSection | null>(null);
  const [addForm, setAddForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('admin_auth');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAuthed(true);
        setAdminName(data.name);
        setAdminRole(data.role);
      } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { data } = await supabase.from('admin_users').select('*').eq('email', loginEmail.trim().toLowerCase()).eq('is_active', true).maybeSingle();
    if (data) {
      setAuthed(true);
      setAdminName(data.name);
      setAdminRole(data.role);
      localStorage.setItem('admin_auth', JSON.stringify({ email: data.email, name: data.name, role: data.role }));
    } else {
      setLoginError(t('admin.access_denied'));
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setAdminName('');
    setAdminRole('');
    localStorage.removeItem('admin_auth');
  };

  const loadData = async (sec: AdminSection) => {
    setLoading(true);
    switch (sec) {
      case 'overview': {
        const [{ count: dCount }, { count: qCount }, { count: aCount }, { count: vCount }, { count: cCount }, { count: vsCount }, { count: vioCount }, { data: payData }] = await Promise.all([
          supabase.from('doctors').select('*', { count: 'exact', head: true }),
          supabase.from('questions').select('*', { count: 'exact', head: true }),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('doctor_videos').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('video_sessions').select('*', { count: 'exact', head: true }),
          supabase.from('ai_violations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('payments').select('*'),
        ]);
        setDoctors([{ id: '', name: '', specialty_id: '', bio: '', education: '', experience_years: 0, photo_url: '', city: '', rating: 0, consultation_count: 0, created_at: '' } as Doctor]);
        setQuestions([{ id: '', specialty_id: '', author_name: '', title: '', body: '', age: null, gender: '', status: '', views: 0, created_at: '' } as Question]);
        setPayments(payData || []);
        (window as unknown as Record<string, unknown>).__counts = { dCount, qCount, aCount, vCount, cCount, vsCount, vioCount };
        break;
      }
      case 'doctors': {
        const { data } = await supabase.from('doctors').select('*, specialty(*)').order('created_at', { ascending: false });
        setDoctors(data || []);
        const { data: specs } = await supabase.from('specialties').select('*').order('name');
        setSpecialties(specs || []);
        break;
      }
      case 'questions': {
        const { data } = await supabase.from('questions').select('*, specialty(*)').order('created_at', { ascending: false }).limit(50);
        setQuestions(data || []);
        break;
      }
      case 'articles': {
        const { data } = await supabase.from('articles').select('*, specialty(*), doctor(*)').order('created_at', { ascending: false });
        setArticles(data || []);
        break;
      }
      case 'videos': {
        const { data } = await supabase.from('doctor_videos').select('*, doctor(*), specialty(*)').order('created_at', { ascending: false });
        setVideos(data || []);
        break;
      }
      case 'audio': {
        const { data } = await supabase.from('doctor_audio').select('*, doctor(*), specialty(*)').order('created_at', { ascending: false });
        setAudios(data || []);
        break;
      }
      case 'courses': {
        const { data } = await supabase.from('courses').select('*, specialty(*), doctor(*)').order('created_at', { ascending: false });
        setCourses(data || []);
        break;
      }
      case 'sessions': {
        const [{ data: vs }, { data: ts }] = await Promise.all([
          supabase.from('video_sessions').select('*, doctor(*)').order('created_at', { ascending: false }).limit(30),
          supabase.from('text_sessions').select('*, doctor(*), specialty(*)').order('created_at', { ascending: false }).limit(30),
        ]);
        setVideoSessions(vs || []);
        setTextSessions(ts || []);
        break;
      }
      case 'payments': {
        const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(50);
        setPayments(data || []);
        break;
      }
      case 'violations': {
        const { data } = await supabase.from('ai_violations').select('*').order('created_at', { ascending: false });
        setViolations(data || []);
        break;
      }
      case 'settings': {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
        setSettings(data);
        break;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authed) loadData(section);
  }, [authed, section]);

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(t('admin.confirm_delete'))) return;
    await supabase.from(table).delete().eq('id', id);
    loadData(section);
  };

  const handleAdd = async (table: string) => {
    const { error } = await supabase.from(table).insert(addForm);
    if (!error) {
      setShowAdd(null);
      setAddForm({});
      loadData(section);
    }
  };

  const handleUpdateViolation = async (id: string, status: string) => {
    await supabase.from('ai_violations').update({ status }).eq('id', id);
    loadData('violations');
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    await supabase.from('site_settings').update({
      site_name: settings.site_name,
      free_session_messages: settings.free_session_messages,
      video_session_price: settings.video_session_price,
      ai_moderation_enabled: settings.ai_moderation_enabled,
      stripe_enabled: settings.stripe_enabled,
      updated_at: new Date().toISOString(),
    }).eq('id', 1);
    alert('تم الحفظ بنجاح');
  };

  if (!authed) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('admin.login')}</h1>
            <p className="text-gray-500 text-sm mt-1">للمالك والمشرفين فقط</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.email')}</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="input-field" placeholder="admin@example.com" required />
            </div>
            {loginError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{loginError}</div>}
            <button type="submit" className="btn-primary w-full">{t('admin.login_btn')}</button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems: { key: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: t('admin.overview'), icon: LayoutDashboard },
    { key: 'doctors', label: t('admin.doctors'), icon: Stethoscope },
    { key: 'questions', label: t('admin.questions'), icon: MessageSquare },
    { key: 'articles', label: t('admin.articles'), icon: FileText },
    { key: 'videos', label: t('admin.videos'), icon: Video },
    { key: 'audio', label: t('admin.audio'), icon: Headphones },
    { key: 'courses', label: t('admin.courses'), icon: BookOpen },
    { key: 'sessions', label: t('admin.sessions'), icon: Users },
    { key: 'payments', label: t('admin.payments'), icon: DollarSign },
    { key: 'violations', label: t('admin.violations'), icon: AlertTriangle },
    { key: 'settings', label: t('admin.settings'), icon: Settings },
  ];

  const counts = (window as unknown as Record<string, unknown>).__counts as Record<string, number | null> | undefined;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h1>
            <p className="text-sm text-gray-500">{adminName} ({adminRole === 'owner' ? 'مالك' : 'مشرف'})</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium">
            <LogOut className="w-4 h-4" />
            {t('admin.logout')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-3 sticky top-24">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-right text-sm font-medium transition-all ${
                    section === item.key ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="card p-8 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ) : section === 'overview' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.overview')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: t('admin.total_doctors'), value: counts?.dCount ?? 0, icon: Stethoscope, color: 'teal' },
                    { label: t('admin.total_questions'), value: counts?.qCount ?? 0, icon: MessageSquare, color: 'blue' },
                    { label: t('admin.total_articles'), value: counts?.aCount ?? 0, icon: FileText, color: 'amber' },
                    { label: t('admin.total_videos'), value: counts?.vCount ?? 0, icon: Video, color: 'purple' },
                    { label: t('admin.total_courses'), value: counts?.cCount ?? 0, icon: BookOpen, color: 'green' },
                    { label: t('admin.total_sessions'), value: counts?.vsCount ?? 0, icon: Users, color: 'pink' },
                  ].map((stat, i) => (
                    <div key={i} className="card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">{stat.value as number}</span>
                      </div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue */}
                <div className="card p-6 mb-6 bg-gradient-to-l from-teal-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('admin.total_revenue')}</p>
                      <p className="text-3xl font-bold text-teal-600">
                        ${payments.reduce((sum, p) => sum + Number(p.amount), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-teal-600" />
                    </div>
                  </div>
                </div>

                {/* Pending violations */}
                <div className="card p-5 mb-6 bg-amber-50 border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                    <div>
                      <p className="font-bold text-gray-800">{t('admin.pending_violations')}</p>
                      <p className="text-2xl font-bold text-amber-600">{counts?.vioCount ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent payments */}
                <h3 className="font-bold text-gray-800 mb-3">{t('admin.recent_payments')}</h3>
                <div className="card overflow-hidden">
                  {payments.slice(0, 5).map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{p.payer_name}</p>
                        <p className="text-xs text-gray-400">{p.payment_type} - {p.payer_email}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-teal-600">${Number(p.amount).toFixed(2)}</p>
                        <span className={`badge text-[10px] ${p.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">لا توجد مدفوعات</p>}
                </div>
              </div>
            ) : section === 'doctors' ? (
              <DataTable
                title={t('admin.doctors')}
                onAdd={() => setShowAdd('doctors')}
                addLabel={t('admin.add')}
                columns={['name', 'city', 'rating', 'specialty']}
                headers={['الاسم', 'المدينة', 'التقييم', 'التخصص']}
                rows={doctors.map(d => ({ id: d.id, name: d.name, city: d.city, rating: Number(d.rating).toFixed(1), specialty: specialtyName(d.specialty) || '-' }))}
                onDelete={(id) => handleDelete('doctors', id)}
                t={t}
              />
            ) : section === 'questions' ? (
              <DataTable
                title={t('admin.questions')}
                columns={['title', 'author_name', 'status', 'specialty']}
                headers={['العنوان', 'السائل', 'الحالة', 'التخصص']}
                rows={questions.map(q => ({ id: q.id, title: q.title, author_name: q.author_name, status: q.status, specialty: specialtyName(q.specialty) || '-' }))}
                onDelete={(id) => handleDelete('questions', id)}
                t={t}
              />
            ) : section === 'articles' ? (
              <DataTable
                title={t('admin.articles')}
                onAdd={() => setShowAdd('articles')}
                addLabel={t('admin.add')}
                columns={['title', 'views', 'specialty']}
                headers={['العنوان', 'المشاهدات', 'التخصص']}
                rows={articles.map(a => ({ id: a.id, title: a.title, views: a.views, specialty: specialtyName(a.specialty) || '-' }))}
                onDelete={(id) => handleDelete('articles', id)}
                t={t}
              />
            ) : section === 'videos' ? (
              <DataTable
                title={t('admin.videos')}
                onAdd={() => setShowAdd('videos')}
                addLabel={t('admin.add')}
                columns={['title', 'views', 'doctor']}
                headers={['العنوان', 'المشاهدات', 'الطبيب']}
                rows={videos.map(v => ({ id: v.id, title: v.title, views: v.views, doctor: v.doctor?.name || '-' }))}
                onDelete={(id) => handleDelete('doctor_videos', id)}
                t={t}
              />
            ) : section === 'audio' ? (
              <DataTable
                title={t('admin.audio')}
                onAdd={() => setShowAdd('audio')}
                addLabel={t('admin.add')}
                columns={['title', 'listens', 'doctor']}
                headers={['العنوان', 'الاستماعات', 'الطبيب']}
                rows={audios.map(a => ({ id: a.id, title: a.title, listens: a.listens, doctor: a.doctor?.name || '-' }))}
                onDelete={(id) => handleDelete('doctor_audio', id)}
                t={t}
              />
            ) : section === 'courses' ? (
              <DataTable
                title={t('admin.courses')}
                onAdd={() => setShowAdd('courses')}
                addLabel={t('admin.add')}
                columns={['title', 'price', 'enrolled_count', 'level']}
                headers={['العنوان', 'السعر', 'المشتركين', 'المستوى']}
                rows={courses.map(c => ({ id: c.id, title: c.title, price: `$${c.price}`, enrolled_count: c.enrolled_count, level: c.level }))}
                onDelete={(id) => handleDelete('courses', id)}
                t={t}
              />
            ) : section === 'sessions' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.sessions')}</h2>
                <h3 className="font-bold text-gray-700 mb-3">جلسات الفيديو</h3>
                <div className="card overflow-hidden mb-6">
                  {videoSessions.map((s, i) => (
                    <div key={s.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{s.patient_name} → {s.doctor?.name || '-'}</p>
                        <p className="text-xs text-gray-400">{new Date(s.scheduled_at).toLocaleString('ar')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-600 text-sm">${Number(s.price).toFixed(0)}</span>
                        <span className={`badge text-[10px] ${s.status === 'completed' ? 'bg-green-100 text-green-600' : s.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                        {s.recording_url && <a href={s.recording_url} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-600"><Eye className="w-4 h-4" /></a>}
                      </div>
                    </div>
                  ))}
                  {videoSessions.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">لا توجد جلسات</p>}
                </div>
                <h3 className="font-bold text-gray-700 mb-3">الجلسات النصية</h3>
                <div className="card overflow-hidden">
                  {textSessions.map((s, i) => (
                    <div key={s.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{s.patient_name} → {s.doctor?.name || 'طبيب متاح'}</p>
                        <p className="text-xs text-gray-400">{specialtyName(s.specialty) || '-'} | {s.message_count}/{s.max_messages} رسالة</p>
                      </div>
                      <span className={`badge text-[10px] ${s.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                    </div>
                  ))}
                  {textSessions.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">لا توجد جلسات</p>}
                </div>
              </div>
            ) : section === 'payments' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.payments')}</h2>
                <div className="card overflow-hidden">
                  {payments.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div>
                        <p className="font-medium text-gray-700 text-sm">{p.payer_name}</p>
                        <p className="text-xs text-gray-400">{p.payment_type} - {p.payer_email}</p>
                        <p className="text-xs text-gray-300">{new Date(p.created_at).toLocaleDateString('ar')}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-teal-600">${Number(p.amount).toFixed(2)}</p>
                        <span className={`badge text-[10px] ${p.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && <p className="p-4 text-center text-gray-400 text-sm">لا توجد مدفوعات</p>}
                </div>
              </div>
            ) : section === 'violations' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.violations')}</h2>
                <div className="space-y-4">
                  {violations.map((v) => (
                    <div key={v.id} className="card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-5 h-5 ${v.severity === 'high' ? 'text-red-500' : v.severity === 'medium' ? 'text-amber-500' : 'text-gray-400'}`} />
                          <span className="font-semibold text-gray-800 text-sm">{v.violation_type}</span>
                        </div>
                        <span className={`badge text-[10px] ${v.status === 'pending' ? 'bg-amber-100 text-amber-600' : v.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{v.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{v.content_snippet}</p>
                      <p className="text-xs text-gray-400 mb-3">المستخدم: {v.user_name} | {v.source_type} | {new Date(v.created_at).toLocaleString('ar')}</p>
                      {v.ai_response && <p className="text-xs text-teal-600 bg-teal-50 rounded-lg p-2 mb-3">رد الذكاء الاصطناعي: {v.ai_response}</p>}
                      {v.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateViolation(v.id, 'resolved')} className="btn-secondary text-xs py-2 px-3 text-green-600 border-green-200">حل</button>
                          <button onClick={() => handleUpdateViolation(v.id, 'rejected')} className="btn-secondary text-xs py-2 px-3 text-red-600 border-red-200">رفض</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {violations.length === 0 && <p className="text-center text-gray-400 py-8">لا توجد مخالفات</p>}
                </div>
              </div>
            ) : section === 'settings' ? (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.settings')}</h2>
                {settings && (
                  <div className="card p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الموقع</label>
                      <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">رسائل الجلسة المجانية</label>
                        <input type="number" value={settings.free_session_messages} onChange={(e) => setSettings({ ...settings, free_session_messages: parseInt(e.target.value) })} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">سعر جلسة الفيديو ($)</label>
                        <input type="number" value={settings.video_session_price} onChange={(e) => setSettings({ ...settings, video_session_price: parseFloat(e.target.value) })} className="input-field" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={settings.ai_moderation_enabled} onChange={(e) => setSettings({ ...settings, ai_moderation_enabled: e.target.checked })} className="w-5 h-5 rounded text-teal-600" />
                        <span className="text-sm font-medium text-gray-700">مراقبة الذكاء الاصطناعي</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={settings.stripe_enabled} onChange={(e) => setSettings({ ...settings, stripe_enabled: e.target.checked })} className="w-5 h-5 rounded text-teal-600" />
                        <span className="text-sm font-medium text-gray-700">تفعيل الدفع</span>
                      </label>
                    </div>
                    <button onClick={handleSaveSettings} className="btn-primary flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      {t('admin.save')}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAdd(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{t('admin.add')} - {showAdd}</h3>
              <button onClick={() => setShowAdd(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {showAdd === 'doctors' && (
                <>
                  <input placeholder="اسم الطبيب" className="input-field" onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
                  <textarea placeholder="نبذة" className="input-field" onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })} />
                  <input placeholder="المدينة" className="input-field" onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} />
                  <input placeholder="الخبرة (سنوات)" type="number" className="input-field" onChange={(e) => setAddForm({ ...addForm, experience_years: e.target.value })} />
                  <input placeholder="رابط الصورة" className="input-field" onChange={(e) => setAddForm({ ...addForm, photo_url: e.target.value })} />
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, specialty_id: e.target.value })}>
                    <option value="">اختر التخصص</option>
                    {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
                  </select>
                  <button onClick={() => handleAdd('doctors')} className="btn-primary w-full">{t('admin.save')}</button>
                </>
              )}
              {showAdd === 'articles' && (
                <>
                  <input placeholder="العنوان" className="input-field" onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
                  <input placeholder="مقتطف" className="input-field" onChange={(e) => setAddForm({ ...addForm, excerpt: e.target.value })} />
                  <textarea placeholder="المحتوى" rows={5} className="input-field" onChange={(e) => setAddForm({ ...addForm, body: e.target.value })} />
                  <input placeholder="رابط الصورة" className="input-field" onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })} />
                  <input placeholder="وقت القراءة (دقائق)" type="number" className="input-field" onChange={(e) => setAddForm({ ...addForm, reading_time_min: e.target.value })} />
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, specialty_id: e.target.value })}>
                    <option value="">اختر التخصص</option>
                    {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
                  </select>
                  <button onClick={() => handleAdd('articles')} className="btn-primary w-full">{t('admin.save')}</button>
                </>
              )}
              {showAdd === 'videos' && (
                <>
                  <input placeholder="العنوان" className="input-field" onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
                  <textarea placeholder="الوصف" className="input-field" onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                  <input placeholder="رابط الفيديو" className="input-field" onChange={(e) => setAddForm({ ...addForm, video_url: e.target.value })} />
                  <input placeholder="رابط الصورة المصغرة" className="input-field" onChange={(e) => setAddForm({ ...addForm, thumbnail_url: e.target.value })} />
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, doctor_id: e.target.value })}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button onClick={() => handleAdd('doctor_videos')} className="btn-primary w-full">{t('admin.save')}</button>
                </>
              )}
              {showAdd === 'audio' && (
                <>
                  <input placeholder="العنوان" className="input-field" onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
                  <textarea placeholder="الوصف" className="input-field" onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                  <input placeholder="رابط الصوت" className="input-field" onChange={(e) => setAddForm({ ...addForm, audio_url: e.target.value })} />
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, doctor_id: e.target.value })}>
                    <option value="">اختر الطبيب</option>
                    {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button onClick={() => handleAdd('doctor_audio')} className="btn-primary w-full">{t('admin.save')}</button>
                </>
              )}
              {showAdd === 'courses' && (
                <>
                  <input placeholder="العنوان" className="input-field" onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
                  <textarea placeholder="الوصف" className="input-field" onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
                  <input placeholder="السعر" type="number" className="input-field" onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                  <input placeholder="المدة (أسابيع)" type="number" className="input-field" onChange={(e) => setAddForm({ ...addForm, duration_weeks: e.target.value })} />
                  <input placeholder="عدد الدروس" type="number" className="input-field" onChange={(e) => setAddForm({ ...addForm, lessons_count: e.target.value })} />
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}>
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                  <select className="input-field" onChange={(e) => setAddForm({ ...addForm, specialty_id: e.target.value })}>
                    <option value="">اختر التخصص</option>
                    {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
                  </select>
                  <button onClick={() => handleAdd('courses')} className="btn-primary w-full">{t('admin.save')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataTable({ title, onAdd, addLabel, columns, headers, rows, onDelete, t }: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  columns: string[];
  headers: string[];
  rows: Record<string, string | number>[];
  onDelete: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {onAdd && (
          <button onClick={onAdd} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        )}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">{t('admin.delete')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id as string} className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-gray-600">{row[col]}</td>
                ))}
                <td className="px-4 py-3">
                  <button onClick={() => onDelete(row.id as string)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">لا توجد بيانات</p>}
      </div>
    </div>
  );
}
