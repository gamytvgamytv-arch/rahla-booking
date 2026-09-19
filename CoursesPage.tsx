import { useEffect, useState } from 'react';
import { BookOpen, Clock, Users, Star, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Course, type Specialty } from '@/lib/supabase';

export default function CoursesPage() {
  const { navigate } = useRouter();
  const { t, specialtyName } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '' });
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('courses').select('*, specialty(*), doctor(*)').eq('is_published', true);
      if (selectedSpecialty) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      setCourses(data || []);
      setLoading(false);
    })();
  }, [selectedSpecialty]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCourse || !enrollForm.name.trim() || !enrollForm.email.trim()) return;
    setEnrolling(true);
    const { error } = await supabase.from('course_enrollments').insert({
      course_id: enrollCourse.id,
      student_name: enrollForm.name.trim(),
      student_email: enrollForm.email.trim(),
    });
    if (!error) {
      await supabase.from('courses').update({ enrolled_count: (enrollCourse.enrolled_count || 0) + 1 }).eq('id', enrollCourse.id);
      await supabase.from('payments').insert({
        payer_email: enrollForm.email.trim(),
        payer_name: enrollForm.name.trim(),
        amount: enrollCourse.price,
        currency: 'USD',
        payment_type: 'course',
        reference_id: enrollCourse.id,
        status: 'pending',
      });
    }
    setEnrolling(false);
    setEnrolled(true);
    setTimeout(() => { setEnrollCourse(null); setEnrolled(false); setEnrollForm({ name: '', email: '' }); }, 2500);
  };

  const levelLabels: Record<string, string> = {
    beginner: t('courses.beginner'),
    intermediate: t('courses.intermediate'),
    advanced: t('courses.advanced'),
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('courses.title')}</h1>
          <p className="text-gray-500">{t('courses.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button onClick={() => setSelectedSpecialty('')} className={`badge transition-all ${!selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t('common.all')}</button>
          {specialties.map((spec) => (
            <button key={spec.id} onClick={() => setSelectedSpecialty(spec.slug)} className={`badge transition-all ${selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{spec.name}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-5"><div className="h-5 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('courses.no_courses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="card card-hover overflow-hidden flex flex-col group">
                <div className="relative h-40 bg-gradient-to-br from-teal-100 to-teal-50 overflow-hidden">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : null}
                  {course.specialty && <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-teal-700 shadow-sm">{specialtyName(course.specialty)}</span>}
                  <span className="absolute top-3 left-3 badge bg-amber-400 text-white shadow-sm">{levelLabels[course.level] || course.level}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{course.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration_weeks} {t('common.weeks')}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.lessons_count} {t('courses.lessons')}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolled_count}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{Number(course.rating).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-teal-600">${course.price}</span>
                    <button onClick={() => { setEnrollCourse(course); setEnrolled(false); }} className="btn-primary text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {t('courses.enroll')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enroll modal */}
      {enrollCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setEnrollCourse(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {enrolled ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">تم التسجيل بنجاح!</h3>
                <p className="text-gray-500">سيصلك تفاصيل الدورة على بريدك الإلكتروني</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{t('courses.enroll')}</h3>
                <p className="text-gray-500 text-sm mb-4">{enrollCourse.title}</p>
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.patient_name')}</label>
                    <input type="text" value={enrollForm.name} onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('sessions.patient_email')}</label>
                    <input type="email" value={enrollForm.email} onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })} className="input-field" required />
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-gray-600 font-medium">{t('courses.price')}</span>
                    <span className="text-2xl font-bold text-teal-600">${enrollCourse.price}</span>
                  </div>
                  <button type="submit" disabled={enrolling} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {enrolling ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري...</> : <><DollarSign className="w-5 h-5" />ادفع وسجل الآن</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
