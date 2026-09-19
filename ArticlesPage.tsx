import { useEffect, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { supabase, type Article, type Specialty } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';

export default function ArticlesPage() {
  const { navigate } = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('articles').select('*, specialty(*), doctor(*)');

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
      setArticles(data || []);
      setLoading(false);
    })();
  }, [selectedSpecialty]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مقالات صحية</h1>
          <p className="text-gray-500">اقرأ وتعلّم عن صحتك من أطباء معتمدين</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
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
              {spec.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-5">
                  <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد مقالات في هذا التخصص بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
