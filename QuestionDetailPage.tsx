import { useEffect, useState } from 'react';
import { ArrowRight, MessageCircle, Eye, Clock, ThumbsUp, User } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Question, type Answer } from '@/lib/supabase';

export default function QuestionDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { specialtyName } = useI18n();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: q } = await supabase
        .from('questions')
        .select('*, specialty(*)')
        .eq('id', id)
        .maybeSingle();

      if (q) {
        setQuestion(q);
        await supabase.from('questions').update({ views: (q.views || 0) + 1 }).eq('id', id);

        const { data: ans } = await supabase
          .from('answers')
          .select('*, doctor(*)')
          .eq('question_id', id)
          .order('helpful_count', { ascending: false });

        setAnswers(ans || []);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-32 mb-6" />
          <div className="card p-8">
            <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">السؤال غير موجود</p>
          <button onClick={() => navigate('/questions')} className="btn-primary">العودة للأسئلة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/questions')}
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للأسئلة والأجوبة
        </button>

        {/* Question */}
        <div className="card p-7 mb-6">
          <div className="flex items-center gap-2 mb-4">
            {question.specialty && (
              <span className="badge bg-teal-50 text-teal-700">{specialtyName(question.specialty)}</span>
            )}
            <span className="badge bg-green-50 text-green-600">مجاب</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-5">{question.body}</p>

          <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-100">
            <span className="flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                {question.author_name.charAt(0)}
              </span>
              {question.author_name}
            </span>
            {question.age && <span>العمر: {question.age}</span>}
            {question.gender && <span>{question.gender}</span>}
            <span className="flex items-center gap-1 mr-auto">
              <Eye className="w-4 h-4" />
              {question.views} مشاهدة
            </span>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" />
            {answers.length} إجابة من الأطباء
          </h2>
        </div>

        {answers.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">لا توجد إجابات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer.id} className="card p-6 animate-slide-up">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shrink-0">
                    {answer.doctor?.photo_url ? (
                      <img
                        src={answer.doctor.photo_url}
                        alt={answer.doctor.name}
                        className="w-full h-full rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-6 h-6 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{answer.doctor?.name || 'طبيب'}</span>
                      {answer.doctor?.specialty && (
                        <span className="text-xs text-teal-600">{specialtyName(answer.doctor.specialty)}</span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-3">{answer.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {answer.helpful_count} وجدت مفيدة
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(answer.created_at).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ask related */}
        <div className="card p-6 mt-8 bg-gradient-to-l from-teal-50 to-white text-center">
          <p className="text-gray-600 mb-4">هل لديك سؤال مشابه؟</p>
          <button onClick={() => navigate('/ask')} className="btn-primary inline-flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            اسأل طبيباً
          </button>
        </div>
      </div>
    </div>
  );
}
