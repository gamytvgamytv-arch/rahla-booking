import { useState } from 'react';
import { Clock, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Article } from '@/lib/supabase';

export default function ArticleCard({ article }: { article: Article }) {
  const { navigate } = useRouter();
  const { specialtyName } = useI18n();
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={() => navigate(`/articles/${article.id}`)}
      className="card card-hover overflow-hidden text-right w-full flex flex-col group"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50">
        {!imgError && article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-teal-300">سهله وبسيطه</span>
          </div>
        )}
        {article.specialty && (
          <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-teal-700 shadow-sm">
            {specialtyName(article.specialty)}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.reading_time_min} دقائق
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views}
            </span>
          </div>
          <span className="flex items-center gap-1 text-teal-600 font-medium group-hover:gap-2 transition-all">
            اقرأ المزيد
            <ArrowLeft className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
