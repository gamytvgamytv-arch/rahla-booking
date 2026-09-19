import { useEffect, useState } from 'react';
import { Send, CheckCircle, AlertCircle, User, Bot, ArrowRight } from 'lucide-react';
import { useRouter, parseQuery } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Specialty, type Doctor } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';

export default function AskPage() {
  const { path, navigate } = useRouter();
  const { t, specialtyName, lang } = useI18n();
  const query = parseQuery(path);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [form, setForm] = useState({ author_name: '', age: '', gender: 'ذكر', title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [specificDoctorId, setSpecificDoctorId] = useState<string | null>(null);
  const [specificDoctor, setSpecificDoctor] = useState<Doctor | null>(null);
  const [realDoctors, setRealDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(data || []);
      if (query.specialty) setSelectedSpecialty(query.specialty);
      if (query.virtual === '1') setIsVirtual(true);
      if (query.doctor) setSpecificDoctorId(query.doctor);
    })();
  }, [query.specialty, query.virtual, query.doctor]);

  useEffect(() => {
    if (specificDoctorId) {
      supabase.from('doctors').select('*, specialty(*)').eq('id', specificDoctorId).maybeSingle().then(({ data }) => {
        setSpecificDoctor(data);
        if (data?.specialty_id) {
          setSelectedSpecialty(data.specialty?.slug || '');
        }
      });
    }
  }, [specificDoctorId]);

  useEffect(() => {
    if (isVirtual && selectedSpecialty) {
      supabase.from('doctors').select('*, specialty(*)').eq('is_virtual', false).order('rating', { ascending: false }).limit(4).then(({ data }) => {
        setRealDoctors(data || []);
      });
    }
  }, [isVirtual, selectedSpecialty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.author_name.trim() || !form.title.trim() || !form.body.trim() || !selectedSpecialty) {
      setError(t('ask.required'));
      return;
    }
    setSubmitting(true);
    const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
    if (!spec) { setError(t('ask.error')); setSubmitting(false); return; }
    const { data, error: insertError } = await supabase.from('questions').insert({
      specialty_id: spec.id,
      author_name: form.author_name.trim(),
      title: form.title.trim(),
      body: form.body.trim(),
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender,
      status: 'pending',
    }).select('id').single();
    setSubmitting(false);
    if (insertError || !data) { setError(t('ask.error')); return; }
    setSuccess(true);
    setTimeout(() => navigate(`/questions/${data.id}`), 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="card p-10 text-center max-w-md animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('ask.success')}</h2>
          <p className="text-gray-500">{t('ask.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('ask.title')}</h1>
          <p className="text-gray-500">{t('ask.subtitle')}</p>
        </div>

        {/* Virtual specialist notice */}
        {isVirtual && (
          <div className="card p-5 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-sm mb-1">{lang === 'ar' ? 'الأخصائي غير متاح حالياً' : 'Specialist currently unavailable'}</h3>
                <p className="text-xs text-amber-700">{lang === 'ar' ? 'هذا الأخصائي الافتراضي غير متاح للاستشارات المباشرة. يمكنك طرح سؤالك أدناه وسيتم توجيهه لأخصائي حقيقي، أو اختيار أحد الأخصائيين الحقيقيين المتاحين.' : 'This virtual specialist is not available for live consultations. You can ask your question below and it will be directed to a real specialist, or choose from available real specialists.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Specific doctor banner */}
        {specificDoctor && !isVirtual && (
          <div className="card p-4 mb-6 bg-teal-50">
            <p className="text-sm text-teal-700">{lang === 'ar' ? `سيتم توجيه سؤالك إلى: ${specificDoctor.name}` : `Your question will be directed to: ${specificDoctor.name}`}</p>
          </div>
        )}

        {/* Real doctors suggestions for virtual */}
        {isVirtual && realDoctors.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              {lang === 'ar' ? 'أخصائيون حقيقيون متاحون' : 'Available Real Specialists'}
              <ArrowRight className="w-4 h-4 text-teal-600" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {realDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-7 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.specialty')} <span className="text-red-500">*</span></label>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="input-field cursor-pointer" required>
              <option value="">{t('ask.select_specialty')}</option>
              {specialties.map((spec) => <option key={spec.id} value={spec.slug}>{specialtyName(spec)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.name')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder={t('ask.name_placeholder')} className="input-field pr-12" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.age')}</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder={t('ask.age')} min="1" max="120" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.gender')}</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field cursor-pointer">
                <option value="ذكر">{t('ask.male')}</option>
                <option value="أنثى">{t('ask.female')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.title_label')} <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('ask.title_placeholder')} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ask.body_label')} <span className="text-red-500">*</span></label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder={t('ask.body_placeholder')} rows={6} className="input-field resize-none" required />
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm animate-slide-up">
              <AlertCircle className="w-5 h-5 shrink-0" />{error}
            </div>
          )}
          <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-700">
            <p className="font-semibold mb-1">{t('ask.notice_title')}</p>
            <p>{t('ask.notice_body')}</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('ask.sending')}</>) : (<><Send className="w-5 h-5" />{t('ask.submit')}</>)}
          </button>
        </form>
      </div>
    </div>
  );
}
