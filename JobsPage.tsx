import { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Send, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type Job } from '@/lib/supabase';

export default function JobsPage() {
  const { t, lang } = useI18n();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    })();
  }, []);

  const handleApply = async () => {
    if (!applyingJob || !form.applicant_name || !form.applicant_email) return;
    setSubmitting(true);
    await supabase.from('job_applications').insert({ ...form, job_id: applyingJob.id });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setApplyingJob(null);
      setSubmitted(false);
      setForm({ applicant_name: '', applicant_email: '', applicant_phone: '', cover_letter: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('jobs.title')}</h1>
          <p className="text-gray-500">{t('jobs.subtitle')}</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-400 py-20">{t('jobs.no_jobs')}</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{job.title}</h3>
                      {job.description && <p className="text-sm text-gray-500 mt-1">{job.description}</p>}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>}
                        {job.job_type && <span className="flex items-center gap-1">{job.job_type === 'full_time' ? t('jobs.full_time') : job.job_type === 'part_time' ? t('jobs.part_time') : t('jobs.contract')}</span>}
                        {job.salary_range && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary_range}</span>}
                      </div>
                      {job.requirements && <p className="text-sm text-gray-400 mt-2">{job.requirements}</p>}
                    </div>
                  </div>
                  <button onClick={() => setApplyingJob(job)} className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap">
                    {t('jobs.apply')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {applyingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setApplyingJob(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-lg font-bold text-gray-800">{t('jobs.submitted')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">{applyingJob.title}</h2>
                  <button onClick={() => setApplyingJob(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.applicant_name')} *</label>
                    <input value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.applicant_email')} *</label>
                    <input type="email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.applicant_phone')}</label>
                    <input value={form.applicant_phone} onChange={(e) => setForm({ ...form, applicant_phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs.cover_letter')}</label>
                    <textarea rows={4} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none" />
                  </div>
                  <button onClick={handleApply} disabled={submitting || !form.applicant_name || !form.applicant_email} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                    {submitting ? '...' : t('jobs.submit')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
