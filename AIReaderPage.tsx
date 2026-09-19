import { useState } from 'react';
import { FileText, Upload, Sparkles, AlertCircle, ScanLine } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function AIReaderPage() {
  const { t } = useI18n();
  const [reportType, setReportType] = useState('lab');
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const reportTypes = [
    { key: 'lab', label: t('ai_reader.title') },
    { key: 'radiology', label: t('nav.radiology') },
    { key: 'pathology', label: t('ai_reader.title') },
  ];

  const handleAnalyze = () => {
    if (!fileName) return;
    setAnalyzing(true);
    setResult(null);
    setRecommendations(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(t('ai_reader.disclaimer') + ' - ' + t('ai_reader.paid_feature'));
      setRecommendations(t('ai_reader.disclaimer'));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('ai_reader.title')}</h1>
          <p className="text-gray-500">{t('ai_reader.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex gap-2 mb-6">
            {reportTypes.map((type) => (
              <button key={type.key} onClick={() => setReportType(type.key)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${reportType === type.key ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {type.label}
              </button>
            ))}
          </div>

          <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-300 transition-colors mb-6">
            <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
            <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7 text-teal-600" />
            </div>
            {fileName ? (
              <p className="text-sm font-medium text-teal-700">{fileName}</p>
            ) : (
              <p className="text-sm text-gray-500">{t('ai_reader.upload')}</p>
            )}
          </label>

          <button onClick={handleAnalyze} disabled={!fileName || analyzing} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            {analyzing ? t('ai_reader.analyzing') : t('ai_reader.analyze')}
          </button>

          {analyzing && (
            <div className="mt-6 flex items-center justify-center gap-3 text-teal-600">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">{t('ai_reader.analyzing')}</span>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-5 bg-teal-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-teal-800">{t('ai_reader.result')}</h3>
                </div>
                <p className="text-sm text-teal-700">{result}</p>
              </div>
              {recommendations && (
                <div className="p-5 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-800">{t('ai_reader.recommendations')}</h3>
                  </div>
                  <p className="text-sm text-amber-700">{recommendations}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
