import { MessageCircle, Eye, Clock } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Question } from '@/lib/supabase';

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) return 'منذ دقائق';
    return `منذ ${hours} ساعة`;
  }
  if (days === 1) return 'منذ يوم';
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} أشهر`;
}

export default function QuestionCard({ question }: { question: Question }) {
  const { navigate } = useRouter();
  const { specialtyName } = useI18n();
  const answerCount = question.answers?.length ?? 0;

  return (
    <button
      onClick={() => navigate(`/questions/${question.id}`)}
      className="card card-hover p-5 text-right w-full"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-800 text-base leading-snug group-hover:text-teal-600 line-clamp-2">
          {question.title}
        </h3>
        {question.specialty && (
          <span className="badge bg-teal-50 text-teal-700 whitespace-nowrap shrink-0">
            {specialtyName(question.specialty)}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{question.body}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px]">
            {question.author_name.charAt(0)}
          </span>
          {question.author_name}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {answerCount} إجابة
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {question.views}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(question.created_at)}
        </span>
      </div>
    </button>
  );
}
