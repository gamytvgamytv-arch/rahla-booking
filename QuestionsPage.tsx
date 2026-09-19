import { useEffect, useState } from 'react';
import { MessageCircle, Eye, Clock, Filter, X } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Question, type Specialty } from '@/lib/supabase';
import QuestionCard from '@/components/QuestionCard';

export default function QuestionsPage() {
  const { navigate } = useRouter();
  const { specialtyName } = useI18n();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    (async () => {
      const [{ data: specs }] = await Promise.all([
        supabase.from('specialties').select('*').order('name'),
      ]);
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('questions').select('*, specialty(*), answers(*)');

      if (selectedSpecialty) {
        const { data: spec } = await supabase
          .from('specialties')
          .select('id')
          .eq('slug', selectedSpecialty)
          .maybeSingle();
        if (spec) {
          dbQuery = dbQuery.eq('specialty_id', spec.id);
        }
      }

      const { data } = await dbQuery.order('created_at', { ascending: false });
      setQuestions(data || []);
      setLoading(false);
    })();
  }, [selectedSpecialty]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">الأسئلة والأجوبة الطبية</h1>
          <p className="text-gray-500">استشارات حقيقية من مستخدمين وأطباء معتمدين</p>
        </div>

        {/* Ask CTA */}
        <div className="card p-6 mb-8 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">لديك سؤال طبي؟</h3>
              <p className="text-gray-500 text-sm">اطرح سؤالك واحصل على إجابة من طبيب مختص</p>
            </div>
            <button
              onClick={() => navigate('/ask')}
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              اسأل طبيباً
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`badge transition-all ${
              !selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            كل التخصصات
          </button>
          {specialties.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.slug)}
              className={`badge transition-all ${
                selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {specialtyName(spec)}
            </button>
          ))}
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد أسئلة في هذا التخصص بعد</p>
            <button onClick={() => navigate('/ask')} className="btn-primary mt-4">كن أول من يسأل</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
