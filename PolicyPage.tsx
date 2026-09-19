import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Ban, Clock, Eye, Gavel } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase, type SitePolicy } from '@/lib/supabase';

export default function PolicyPage() {
  const { t, lang } = useI18n();
  const [policies, setPolicies] = useState<SitePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_policies').select('*').eq('is_active', true).order('created_at').then(({ data }) => {
      setPolicies(data || []);
      setLoading(false);
    });
  }, []);

  const rules = lang === 'ar' ? [
    { icon: Ban, text: 'لا كلام في الدين أو المذهب' },
    { icon: Ban, text: 'لا كلام في السياسة' },
    { icon: Ban, text: 'لا عرض أو تبادل أي وسائل تواصل (هاتف، بريد، مواقع تواصل اجتماعي)' },
    { icon: Ban, text: 'لا إساءة أو إهانة لأي شخص' },
    { icon: Ban, text: 'لا نشر محتوى غير طبي أو غير صحي' },
    { icon: Ban, text: 'لا تكرار نفس السؤال أو التعليق' },
    { icon: Ban, text: 'الالتزام بالآداب العامة والاحترام المتبادل' },
  ] : [
    { icon: Ban, text: 'No religious or sectarian discussion' },
    { icon: Ban, text: 'No political discussion' },
    { icon: Ban, text: 'No sharing or exchanging contact information' },
    { icon: Ban, text: 'No abuse or insult to anyone' },
    { icon: Ban, text: 'No non-medical or unhealthy content' },
    { icon: Ban, text: 'No repeating the same question or comment' },
    { icon: Ban, text: 'Maintain public etiquette and mutual respect' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{lang === 'ar' ? 'سياسة الموقع' : 'Site Policy'}</h1>
          <p className="text-gray-500">{lang === 'ar' ? 'يرجى الالتزام بالسياسات التالية لضمان بيئة آمنة للجميع' : 'Please follow these policies to ensure a safe environment'}</p>
        </div>

        {/* AI Monitoring Banner */}
        <div className="card p-5 mb-6 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">{lang === 'ar' ? 'مراقبة ذكية' : 'AI Monitoring'}</h3>
              <p className="text-xs text-gray-600">{lang === 'ar' ? 'الموقع مراقب بالكامل من قبل خادم ذكي. عند انتهاك سياسة الموقع يتم إرسال تحذير فوري ووقف الحساب مؤقتاً لمدة ساعة حتى يتم الفصل في المخالفة. يتم إرسال رسالة وأشعار بالصور للمالك والمشرفين لاتخاذ الإجراءات.' : 'The site is fully monitored by an AI server. When a policy violation occurs, an instant warning is sent and the account is temporarily suspended for one hour. A notification with screenshots is sent to the owner and supervisors.'}</p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-teal-600" />
            {lang === 'ar' ? 'القواعد' : 'Rules'}
          </h3>
          <div className="space-y-3">
            {rules.map((rule, i) => {
              const Icon = rule.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-700 pt-1">{rule.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Penalties */}
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {lang === 'ar' ? 'العقوبات' : 'Penalties'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-sm text-gray-700 pt-1">{lang === 'ar' ? 'المخالفة الأولى: تحذير ووقف الحساب لمدة ساعة' : 'First violation: warning and 1-hour account suspension'}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm text-gray-700 pt-1">{lang === 'ar' ? 'تكرار المخالفات: تغليظ العقوبة قد تصل إلى حظر دائم' : 'Repeated violations: escalating penalties up to permanent ban'}</p>
            </div>
          </div>
        </div>

        {/* Database policies */}
        {!loading && policies.length > 0 && (
          <div className="space-y-4">
            {policies.map((p) => (
              <div key={p.id} className="card p-6">
                <h3 className="font-bold text-gray-800 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
