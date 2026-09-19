import { useEffect, useState } from 'react';
import { Search, MapPin, Star, Filter, X } from 'lucide-react';
import { useRouter, parseQuery, getPathOnly } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type Doctor, type Specialty } from '@/lib/supabase';
import DoctorCard from '@/components/DoctorCard';

export default function DoctorsPage() {
  const { path, navigate } = useRouter();
  const { specialtyName } = useI18n();
  const query = parseQuery(path);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(query.q || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(query.specialty || '');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    setSearch(query.q || '');
    setSelectedSpecialty(query.specialty || '');
  }, [query.q, query.specialty]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('doctors').select('*, specialty(*)');

      if (search.trim()) {
        dbQuery = dbQuery.ilike('name', `%${search.trim()}%`);
      }
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
      if (selectedCity) {
        dbQuery = dbQuery.eq('city', selectedCity);
      }

      const { data } = await dbQuery.order('rating', { ascending: false });
      setDoctors(data || []);
      setLoading(false);
    })();
  }, [search, selectedSpecialty, selectedCity]);

  const cities = ['دمشق', 'حلب', 'حمص', 'اللاذقية'];

  const clearFilters = () => {
    setSearch('');
    setSelectedSpecialty('');
    setSelectedCity('');
    navigate('/doctors');
  };

  const hasFilters = search || selectedSpecialty || selectedCity;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">دليل الأطباء</h1>
          <p className="text-gray-500">تصفح نخبة من الأطباء المعتمدين في مختلف التخصصات</p>
        </div>

        {/* Search & Filters */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الطبيب..."
                className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
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

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                <MapPin className="w-4 h-4" />
                المدينة:
              </span>
              <button
                onClick={() => setSelectedCity('')}
                className={`badge transition-all ${
                  !selectedCity ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`badge transition-all ${
                    selectedCity === city ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {loading ? 'جاري البحث...' : `${doctors.length} طبيب`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 mx-auto mb-4" />
                <div className="h-5 bg-gray-100 rounded mx-auto w-32 mb-2" />
                <div className="h-4 bg-gray-100 rounded mx-auto w-24" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">لا يوجد أطباء مطابقون للبحث</p>
            <button onClick={clearFilters} className="btn-secondary mt-4">مسح الفلاتر</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
