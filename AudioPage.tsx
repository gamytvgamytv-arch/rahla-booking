import { useEffect, useState } from 'react';
import { Headphones, Play, Pause, Eye } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type DoctorAudio, type Specialty } from '@/lib/supabase';

export default function AudioPage() {
  const { t, specialtyName } = useI18n();
  const [audios, setAudios] = useState<DoctorAudio[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties(specs || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('doctor_audio').select('*, doctor(*), specialty(*)');
      if (selectedSpecialty) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      setAudios(data || []);
      setLoading(false);
    })();
  }, [selectedSpecialty]);

  const togglePlay = (audio: DoctorAudio) => {
    if (playingId === audio.id) {
      audioEl?.pause();
      setPlayingId(null);
    } else {
      if (audioEl) audioEl.pause();
      const el = new Audio(audio.audio_url);
      el.play();
      setAudioEl(el);
      setPlayingId(audio.id);
      supabase.from('doctor_audio').update({ listens: (audio.listens || 0) + 1 }).eq('id', audio.id);
      el.onended = () => setPlayingId(null);
    }
  };

  useEffect(() => {
    return () => { if (audioEl) audioEl.pause(); };
  }, [audioEl]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('audio.title')}</h1>
          <p className="text-gray-500">{t('audio.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button onClick={() => setSelectedSpecialty('')} className={`badge transition-all ${!selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t('common.all')}</button>
          {specialties.map((spec) => (
            <button key={spec.id} onClick={() => setSelectedSpecialty(spec.slug)} className={`badge transition-all ${selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{spec.name}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100" />
                <div className="flex-1"><div className="h-5 bg-gray-100 rounded w-1/2 mb-2" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : audios.length === 0 ? (
          <div className="text-center py-20">
            <Headphones className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('audio.no_audio')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {audios.map((audio) => (
              <div key={audio.id} className="card card-hover p-5 flex items-center gap-4">
                <button onClick={() => togglePlay(audio)} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-md">
                  {playingId === audio.id ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white mr-[-2px]" fill="white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{audio.title}</h3>
                  {audio.doctor && <p className="text-sm text-teal-600 mb-1">{audio.doctor.name}</p>}
                  {audio.description && <p className="text-sm text-gray-500 line-clamp-1">{audio.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-gray-400 shrink-0">
                  {audio.duration_seconds > 0 && <span className="flex items-center gap-1"><Headphones className="w-3.5 h-3.5" />{formatDuration(audio.duration_seconds)}</span>}
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{audio.listens}</span>
                  {audio.specialty && <span className="badge bg-teal-50 text-teal-700">{specialtyName(audio.specialty)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
