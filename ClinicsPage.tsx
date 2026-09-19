import { useEffect, useState } from 'react';
import { MapPin, Phone, Calendar, X, Building2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type Clinic } from '@/lib/supabase';

export default function ClinicsPage() {
  const { t } = useI18n();
  const [clinics, setClinics] = useState<(Clinic & { doctor?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingClinic, setBookingClinic] = useState<Clinic | null>(null);
  const [bookForm, setBookForm] = useState({ patient_name: '', patient_email: '', patient_phone: '', scheduled_at: '' });
  const [bookSuccess, setBookSuccess] = useState(false);

  useEffect(() => {
    supabase.from('clinics').select('*, doctor(name)').eq('is_active', true).order('created_at', { ascending: false }).then(({ data }) => {
      setClinics(data || []);
      setLoading(false);
    });
  }, []);

  const handleBook = async () => {
    if (!bookingClinic || !bookForm.patient_name || !bookForm.scheduled_at) return;
    await supabase.from('clinic_bookings').insert({
      clinic_id: bookingClinic.id,
      patient_name: bookForm.patient_name,
      patient_email: bookForm.patient_email,
      patient_phone: bookForm.patient_phone,
      scheduled_at: bookForm.scheduled_at,
    });
    setBookSuccess(true);
    setTimeout(() => { setBookingClinic(null); setBookSuccess(false); setBookForm({ patient_name: '', patient_email: '', patient_phone: '', scheduled_at: '' }); }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('clinics.title')}</h1>
        <p className="text-gray-500 mb-6">{t('clinics.subtitle')}</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="card p-5 animate-pulse"><div className="h-20 bg-gray-100 rounded mb-3" /><div className="h-4 bg-gray-100 rounded w-2/3" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((c) => (
              <div key={c.id} className="card overflow-hidden hover:shadow-lg transition-all">
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{c.name}</h3>
                      {c.doctor && <p className="text-xs text-gray-400">{c.doctor.name}</p>}
                    </div>
                  </div>
                  {c.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>}
                  {c.address && <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" />{c.address}</p>}
                  {c.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mb-3"><Phone className="w-3.5 h-3.5" />{c.phone}</p>}
                  <button onClick={() => setBookingClinic(c)} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('clinics.book')}
                  </button>
                </div>
              </div>
            ))}
            {clinics.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">{t('common.loading')}</p>}
          </div>
        )}
      </div>

      {bookingClinic && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBookingClinic(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            {bookSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-3"><Calendar className="w-7 h-7 text-green-600" /></div>
                <p className="font-bold text-gray-800">{t('booking.success')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">{t('clinics.book')} - {bookingClinic.name}</h3>
                  <button onClick={() => setBookingClinic(null)} className="text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <input placeholder={t('booking.name')} value={bookForm.patient_name} onChange={(e) => setBookForm({ ...bookForm, patient_name: e.target.value })} className="input-field" />
                  <input type="email" placeholder={t('booking.email')} value={bookForm.patient_email} onChange={(e) => setBookForm({ ...bookForm, patient_email: e.target.value })} className="input-field" />
                  <input type="tel" placeholder={t('booking.phone')} value={bookForm.patient_phone} onChange={(e) => setBookForm({ ...bookForm, patient_phone: e.target.value })} className="input-field" />
                  <input type="datetime-local" value={bookForm.scheduled_at} onChange={(e) => setBookForm({ ...bookForm, scheduled_at: e.target.value })} className="input-field" />
                  <button onClick={handleBook} className="btn-primary w-full">{t('booking.submit')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
