import { useEffect, useState } from 'react';
import { Star, MapPin, Clock, MessageCircle, Calendar, Stethoscope, BadgeCheck, Bot } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import type { Doctor } from '@/lib/supabase';

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { navigate } = useRouter();
  const { specialtyName, t, lang } = useI18n();
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(doctor.photo_url);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setImgSrc(doctor.photo_url);
    setImgError(false);
  }, [doctor.photo_url]);

  const handleConsult = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doctor.is_virtual) {
      navigate(`/ask?specialty=${doctor.specialty?.slug || ''}&virtual=1`);
    } else {
      navigate(`/ask?specialty=${doctor.specialty?.slug || ''}&doctor=${doctor.id}`);
    }
  };

  const handleSession = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/sessions?doctor=${doctor.id}`);
  };

  return (
    <div
      onClick={() => navigate(`/doctors/${doctor.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card card-hover p-5 text-right w-full flex flex-col items-center group cursor-pointer relative"
    >
      {/* Hover tooltip with full info */}
      {hovered && (
        <div className="absolute z-20 top-full mt-2 right-0 w-64 card p-4 shadow-xl text-right animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-bold text-gray-800 text-sm">{doctor.name}</p>
            {doctor.is_verified && <BadgeCheck className="w-4 h-4 text-teal-500" />}
            {doctor.is_virtual && <span className="badge bg-purple-100 text-purple-600 text-[10px]">{lang === 'ar' ? 'افتراضي' : 'Virtual'}</span>}
          </div>
          {doctor.specialty && <p className="text-xs text-teal-600 mb-2">{specialtyName(doctor.specialty)}</p>}
          {doctor.bio && <p className="text-xs text-gray-500 mb-2 line-clamp-3">{doctor.bio}</p>}
          <div className="space-y-1 text-xs text-gray-500">
            {doctor.city && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.city}</p>}
            <p className="flex items-center gap-1"><Clock className="w-3 h-3" />{doctor.experience_years} {lang === 'ar' ? 'سنوات خبرة' : 'years exp.'}</p>
            <p className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{doctor.consultation_count} {lang === 'ar' ? 'استشارة' : 'consults'}</p>
            {doctor.phone_number && !doctor.is_virtual && <p className="flex items-center gap-1 text-teal-600"><Stethoscope className="w-3 h-3" />{doctor.phone_number}</p>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/doctors/${doctor.id}`); }} className="text-xs text-teal-600 hover:text-teal-700 mt-2 font-medium">
            {lang === 'ar' ? 'عرض الصفحة الكاملة' : 'View full profile'}
          </button>
        </div>
      )}

      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center ring-2 ring-teal-100 group-hover:ring-teal-300 transition-all">
          {!imgError && imgSrc ? (
            <img src={imgSrc} alt={doctor.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : doctor.is_virtual ? (
            <Bot className="w-10 h-10 text-teal-600" />
          ) : (
            <span className="text-3xl font-bold text-teal-600">{doctor.name.replace('د. ', '').charAt(0)}</span>
          )}
        </div>
        <div className="absolute -bottom-1 -left-1 bg-amber-400 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="text-xs font-bold text-white">{Number(doctor.rating).toFixed(1)}</span>
        </div>
        {doctor.is_virtual && (
          <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1 shadow-sm">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      <h3 className="font-bold text-gray-800 text-lg group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
        {doctor.name}
        {doctor.is_verified && <BadgeCheck className="w-4 h-4 text-teal-500" />}
      </h3>
      {doctor.specialty && <p className="text-teal-600 text-sm font-medium mt-1">{specialtyName(doctor.specialty)}</p>}
      <p className="text-gray-400 text-xs mt-1 line-clamp-2 text-center">{doctor.bio}</p>

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doctor.experience_years} {lang === 'ar' ? 'سنة' : 'yrs'}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{doctor.consultation_count}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 w-full">
        <button onClick={handleConsult} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          {t('sessions.start_free')}
        </button>
        <button onClick={handleSession} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'طلب جلسة' : 'Session'}
        </button>
      </div>
    </div>
  );
}
