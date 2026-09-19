import { useEffect, useState } from 'react';
import { BookOpen, Newspaper, Wrench, ExternalLink } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useRouter, parseQuery } from '@/lib/router';
import { supabase, type SpecialtyLibraryItem, type Specialty } from '@/lib/supabase';

export default function LibraryPage() {
  const { t, specialtyName } = useI18n();
  const { path, navigate } = useRouter();
  const query = parseQuery(path);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string>(query.specialty || '');
  const [items, setItems] = useState<SpecialtyLibraryItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('specialties').select('*').order('name').then(({ data }) => setSpecialties(data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from('specialty_library_items').select('*, specialty(*)').order('created_at', { ascending: false }).limit(50);
    if (selectedSpec) q = q.eq('specialty_id', selectedSpec);
    if (filter !== 'all') q = q.eq('item_type', filter);
    q.then(({ data }) => { setItems(data || []); setLoading(false); });
  }, [selectedSpec, filter]);

  const typeIcons: Record<string, typeof BookOpen> = { news: Newspaper, book: BookOpen, service: Wrench, article: BookOpen };
  const typeColors: Record<string, string> = { news: 'blue', book: 'teal', service: 'amber', article: 'gray' };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('library.title')}</h1>
        <p className="text-gray-500 mb-6">{t('library.subtitle')}</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <select value={selectedSpec} onChange={(e) => { setSelectedSpec(e.target.value); navigate(`/library?specialty=${e.target.value}`); }} className="input-field max-w-xs">
            <option value="">{t('doctors.all_specialties')}</option>
            {specialties.map((s) => <option key={s.id} value={s.id}>{specialtyName(s)}</option>)}
          </select>
          <div className="flex gap-2">
            {['all', 'news', 'book', 'service'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? t('common.all') : f === 'news' ? t('library.news') : f === 'book' ? t('library.books') : t('library.services')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="card p-5 animate-pulse"><div className="h-4 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-full" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const Icon = typeIcons[item.item_type] || BookOpen;
              const color = typeColors[item.item_type] || 'gray';
              return (
                <div key={item.id} className="card p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</h3>
                      {item.source && <p className="text-xs text-gray-400 mt-0.5">{item.source}</p>}
                    </div>
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1">
                      {t('library.read')} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {item.specialty && <p className="text-xs text-gray-300 mt-2">{specialtyName(item.specialty)}</p>}
                </div>
              );
            })}
            {items.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
