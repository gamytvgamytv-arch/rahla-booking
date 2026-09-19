import { useState, useEffect } from 'react';
import { Heart, Stethoscope, FileText, Video, Pill, Calculator, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type Favorite } from '@/lib/supabase';

const itemIcons: Record<string, typeof Heart> = {
  doctor: Stethoscope,
  article: FileText,
  video: Video,
  product: Pill,
  test: Calculator,
  course: BookOpen,
};

export default function FavoritesPage() {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('favorites').select('*').order('created_at', { ascending: false });
      setFavorites(data || []);
      setLoading(false);
    })();
  }, []);

  const tabs = [
    { key: 'all', label: t('common.all') },
    { key: 'doctor', label: t('favorites.doctors') },
    { key: 'article', label: t('favorites.articles') },
    { key: 'video', label: t('favorites.videos') },
    { key: 'product', label: t('favorites.products') },
    { key: 'test', label: t('favorites.tests') },
    { key: 'course', label: t('favorites.courses') },
  ];

  const filtered = activeTab === 'all' ? favorites : favorites.filter((f) => f.item_type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('favorites.title')}</h1>
          <p className="text-gray-500">{t('favorites.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">{t('favorites.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((fav) => {
              const Icon = itemIcons[fav.item_type] || Heart;
              return (
                <div key={fav.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{fav.item_type}</p>
                      <p className="text-xs text-gray-400">{fav.item_id.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
