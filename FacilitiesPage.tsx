import { useState, useEffect } from 'react';
import { Building2, Pill, HeartPulse, Home, Stethoscope, MapPin, Phone, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type AdditionalFacility, type PharmacyProduct } from '@/lib/supabase';

const facilityIcons: Record<string, typeof Building2> = {
  rehab: HeartPulse,
  addiction: HeartPulse,
  nursing: Home,
  pharmacy: Pill,
  clinic: Stethoscope,
  radiology: Building2,
  lab: Building2,
};

export default function FacilitiesPage() {
  const { t, lang } = useI18n();
  const [facilities, setFacilities] = useState<AdditionalFacility[]>([]);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: facData }, { data: prodData }] = await Promise.all([
        supabase.from('additional_facilities').select('*').eq('is_active', true).order('name'),
        supabase.from('pharmacy_products').select('*').eq('is_active', true).order('name'),
      ]);
      setFacilities(facData || []);
      setProducts(prodData || []);
      setLoading(false);
    })();
  }, []);

  const types = [
    { key: 'all', label: t('facilities.all_types') },
    { key: 'rehab', label: t('facilities.rehab') },
    { key: 'addiction', label: t('facilities.addiction') },
    { key: 'nursing', label: t('facilities.nursing') },
    { key: 'pharmacy', label: t('facilities.pharmacy') },
    { key: 'clinic', label: t('facilities.clinics') },
    { key: 'radiology', label: t('facilities.radiology') },
    { key: 'lab', label: t('facilities.labs') },
  ];

  const filtered = activeType === 'all' ? facilities : facilities.filter((f) => f.facility_type === activeType);
  const pharmacyFacilities = facilities.filter((f) => f.facility_type === 'pharmacy');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('facilities.title')}</h1>
          <p className="text-gray-500">{t('facilities.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {types.map((type) => (
            <button key={type.key} onClick={() => setActiveType(type.key)} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeType === type.key ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {type.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {filtered.map((facility) => {
                const Icon = facilityIcons[facility.facility_type] || Building2;
                return (
                  <div key={facility.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{facility.name}</h3>
                        {facility.description && <p className="text-sm text-gray-500 mt-1">{facility.description}</p>}
                      </div>
                    </div>
                    {facility.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 text-teal-500" /> {facility.address}
                      </div>
                    )}
                    {facility.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Phone className="w-4 h-4 text-teal-500" /> {facility.phone}
                      </div>
                    )}
                    {facility.services && (
                      <p className="text-sm text-gray-400 mt-2">{facility.services}</p>
                    )}
                    {facility.facility_type !== 'pharmacy' && (
                      <button className="mt-4 w-full bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-2.5 rounded-xl transition-colors text-sm">
                        {t('facilities.book')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {activeType === 'all' || activeType === 'pharmacy' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('facilities.products')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Pill className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h3>
                        {product.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-700">{product.price} {product.currency}</span>
                          <button onClick={() => setCart([...cart, product.id])} className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors">
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {product.delivery_option === 'delivery' ? t('facilities.delivery') : product.delivery_option === 'pickup' ? t('facilities.pickup') : t('facilities.hand_delivery')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
