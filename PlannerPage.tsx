import { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Bell, MessageSquare, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type SpecialistPlanner, type Doctor } from '@/lib/supabase';

export default function PlannerPage() {
  const { t } = useI18n();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [sessions, setSessions] = useState<SpecialistPlanner[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client_name: '', scheduled_at: '', duration_minutes: '60', price: '', notes: '' });

  useEffect(() => {
    supabase.from('doctors').select('*').limit(50).then(({ data }) => setDoctors(data || []));
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      supabase.from('specialist_planner').select('*').eq('doctor_id', selectedDoctor).order('scheduled_at', { ascending: false }).then(({ data }) => {
        setSessions(data || []);
      });
      const today = new Date().toISOString().slice(0, 10);
      supabase.from('questions').select('*', { count: 'exact', head: true }).gte('created_at', today).then(({ count }) => {
        setTodayCount(count || 0);
      });
    }
  }, [selectedDoctor]);

  const handleAdd = async () => {
    if (!selectedDoctor || !form.client_name || !form.scheduled_at) return;
    await supabase.from('specialist_planner').insert({
      doctor_id: selectedDoctor,
      session_type: 'paid',
      client_name: form.client_name,
      scheduled_at: form.scheduled_at,
      duration_minutes: parseInt(form.duration_minutes) || 60,
      price: parseFloat(form.price) || 0,
      notes: form.notes,
    });
    await supabase.from('planner_reminders').insert({
      planner_id: (await supabase.from('specialist_planner').select('id').eq('doctor_id', selectedDoctor).order('created_at', { ascending: false }).limit(1).single()).data?.id,
      reminder_type: 'before',
      remind_at: new Date(new Date(form.scheduled_at).getTime() - 30 * 60000).toISOString(),
    });
    setShowAdd(false);
    setForm({ client_name: '', scheduled_at: '', duration_minutes: '60', price: '', notes: '' });
    supabase.from('specialist_planner').select('*').eq('doctor_id', selectedDoctor).order('scheduled_at', { ascending: false }).then(({ data }) => setSessions(data || []));
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('planner.title')}</h1>
        <p className="text-gray-500 mb-6">{t('planner.subtitle')}</p>

        <div className="card p-4 mb-6">
          <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="input-field">
            <option value="">{t('sessions.select_doctor')}</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {selectedDoctor && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{todayCount}</p>
                    <p className="text-xs text-gray-500">{t('planner.today_questions')}</p>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
                    <p className="text-xs text-gray-500">{t('planner.title')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('planner.title')}</h2>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('planner.add_session')}
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{s.client_name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(s.scheduled_at).toLocaleString()}</span>
                      <span>{s.duration_minutes} {t('common.minutes')}</span>
                    </div>
                    {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-teal-600 text-sm">${s.price}</p>
                    <span className={`badge text-[10px] ${s.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && <p className="text-center text-gray-400 py-8">{t('planner.no_sessions')}</p>}
            </div>
          </>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{t('planner.add_session')}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder={t('planner.client_name')} value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="input-field" />
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="input-field" />
              <input type="number" placeholder={t('planner.duration')} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="input-field" />
              <input type="number" placeholder={t('planner.price')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
              <textarea placeholder={t('planner.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
              <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                {t('planner.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
