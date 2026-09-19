import { useEffect, useState } from 'react';
import { ArrowRight, Clock, Eye, User, Calendar, Share2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Article } from '@/lib/supabase';

export default function ArticleDetailPage({ id }: { id: string }) {
  const { navigate } = useRouter();
  const { specialtyName } = useI18n();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: art } = await supabase
        .from('articles')
        .select('*, specialty(*), doctor(*)')
        .eq('id', id)
        .maybeSingle();

      if (art) {
        setArticle(art);
        await supabase.from('articles').update({ views: (art.views || 0) + 1 }).eq('id', id);
      }
      setLoading(false);
    })();
  }, [id]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 animate-pulse">
          <div className="h-6 bg-gray-100 rounded w-32 mb-6" />
          <div className="h-64 bg-gray-100 rounded-2xl mb-6" />
          <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-full mb-2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">المقال غير موجود</p>
          <button onClick={() => navigate('/articles')} className="btn-primary">العودة للمقالات</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/articles')}
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمقالات
        </button>

        {/* Hero image */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 mb-6">
          {!imgError && article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-bold text-teal-300">سهله وبسيطه</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {article.specialty && (
            <span className="badge bg-teal-50 text-teal-700">{specialtyName(article.specialty)}</span>
          )}
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            {article.reading_time_min} دقائق قراءة
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Eye className="w-4 h-4" />
            {article.views} مشاهدة
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            {formatDate(article.created_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-gray-500 leading-relaxed mb-6 border-r-4 border-teal-500 pr-4">
          {article.excerpt}
        </p>

        {/* Author */}
        {article.doctor && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center overflow-hidden">
              {article.doctor.photo_url ? (
                <img
                  src={article.doctor.photo_url}
                  alt={article.doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <User className="w-6 h-6 text-teal-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{article.doctor.name}</p>
              {article.doctor.specialty && (
                <p className="text-sm text-teal-600">{specialtyName(article.doctor.specialty)}</p>
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {article.body.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i}>{line.replace('## ', '')}</h2>;
            }
            if (line.trim() === '') return null;
            return <p key={i}>{line}</p>;
          })}
        </article>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => navigate(`/doctors?specialty=${article.specialty?.slug || ''}`)}
            className="btn-secondary flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            أطباء {specialtyName(article.specialty)}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              }
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            مشاركة
          </button>
        </div>
      </div>
    </div>
  );
}
