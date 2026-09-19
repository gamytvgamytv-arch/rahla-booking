import { useState } from 'react';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  FileText,
  UploadCloud,
  FileCheck,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Lock,
  PenTool,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type Step = 1 | 2 | 3;

interface UploadedFile {
  name: string;
  size: number;
}

export function FacilityRegistrationPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, direction } = useApp();
  const ArrowNext = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const ArrowBack = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<Step>(1);
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [commercialFile, setCommercialFile] = useState<UploadedFile | null>(null);
  const [healthFile, setHealthFile] = useState<UploadedFile | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const stepTitles: Record<Step, string> = {
    1: t.facilityRegistration.step1Title,
    2: t.facilityRegistration.step2Title,
    3: t.facilityRegistration.step3Title,
  };

  const stepSubtitles: Record<Step, string> = {
    1: t.facilityRegistration.step1Subtitle,
    2: t.facilityRegistration.step2Subtitle,
    3: t.facilityRegistration.step3Subtitle,
  };

  const canProceed = (): boolean => {
    if (step === 1) return facilityName.trim() !== '' && facilityType.trim() !== '' && city.trim() !== '' && email.trim() !== '';
    if (step === 2) return commercialFile !== null && healthFile !== null;
    if (step === 3) return agreed && signature.trim() !== '';
    return false;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: UploadedFile | null) => void) => {
    const file = e.target.files?.[0];
    if (file) setter({ name: file.name, size: file.size });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setError(false);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1800);
  };

  const resetForm = () => {
    setStep(1);
    setFacilityName('');
    setFacilityType('');
    setCity('');
    setDistrict('');
    setEmail('');
    setPhone('');
    setCommercialFile(null);
    setHealthFile(null);
    setAgreed(false);
    setSignature('');
    setSubmitted(false);
    setError(false);
  };

  if (submitted) {
    return (
      <div className="bg-neutral-50 min-h-screen flex items-center justify-center py-12">
        <div className="max-w-lg w-full mx-4 bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-primary-100 ring-4 ring-primary-50">
            <CheckCircle2 className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-neutral-900">{t.facilityRegistration.submitSuccess}</h2>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{t.facilityRegistration.submitSuccessDesc}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
            >
              {t.facilityRegistration.backToHome}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50"
            >
              {t.facilityRegistration.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-10 lg:py-14">
        <div className="container-x">
          <h1 className="text-2xl lg:text-3xl font-bold">{t.facilityRegistration.title}</h1>
          <p className="mt-2 text-primary-100 text-sm lg:text-base">{t.facilityRegistration.subtitle}</p>
        </div>
      </div>

      <div className="container-x py-6 lg:py-10">
        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {([1, 2, 3] as Step[]).map((s, idx) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        s < step
                          ? 'bg-primary-600 text-white'
                          : s === step
                          ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {s < step ? <Check className="h-5 w-5" /> : s}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${s <= step ? 'text-primary-700' : 'text-neutral-400'}`}>
                      {stepTitles[s]}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${s < step ? 'bg-primary-600' : 'bg-neutral-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 lg:p-8">
            <h2 className="text-lg font-bold text-neutral-900">{stepTitles[step]}</h2>
            <p className="mt-1 text-sm text-neutral-500">{stepSubtitles[step]}</p>

            <div className="mt-6">
              {/* Step 1: Institution info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.facilityName}</label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder={t.facilityRegistration.facilityNamePlaceholder}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.facilityType}</label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        placeholder={t.facilityRegistration.facilityTypePlaceholder}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.city}</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={t.facilityRegistration.cityPlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.district}</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder={t.facilityRegistration.districtPlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.contactEmail}</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.facilityRegistration.contactEmailPlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.contactPhone}</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.facilityRegistration.contactPhonePlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500">{t.facilityRegistration.uploadDocsDesc}</p>
                  {[
                    { label: t.facilityRegistration.commercialLicense, file: commercialFile, setter: setCommercialFile },
                    { label: t.facilityRegistration.healthLicense, file: healthFile, setter: setHealthFile },
                  ].map((doc, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{doc.label}</label>
                      {doc.file ? (
                        <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <FileCheck className="h-5 w-5 text-primary-600" />
                            <div>
                              <p className="text-sm font-medium text-neutral-900 truncate max-w-48">{doc.file.name}</p>
                              <p className="text-xs text-neutral-400">{formatFileSize(doc.file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => doc.setter(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white hover:text-neutral-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-8 cursor-pointer transition-all hover:border-primary-400 hover:bg-primary-50/30">
                          <UploadCloud className="h-8 w-8 text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-600">{t.facilityRegistration.uploadHere}</span>
                          <span className="text-xs text-neutral-400">{t.facilityRegistration.dragDrop}</span>
                          <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => handleFileUpload(e, doc.setter)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Terms & agreement */}
              {step === 3 && (
                <div className="space-y-5">
                  {/* Terms */}
                  <div className="rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary-600" />
                        {t.facilityRegistration.termsTitle}
                      </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                      <p className="text-sm text-neutral-600 font-medium">{t.facilityRegistration.termsIntro}</p>
                      {['term1', 'term2', 'term3', 'term4', 'term5'].map((term, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 mt-0.5">{idx + 1}</span>
                          <p className="text-sm text-neutral-600 leading-relaxed">{t.facilityRegistration[term as keyof typeof t.facilityRegistration]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Liability highlights */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-bold text-red-700">{t.facilityRegistration.absoluteLiability}</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.facilityRegistration.absoluteLiabilityDesc}</p>
                    </div>
                    <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lock className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-bold text-primary-700">{t.facilityRegistration.documentAuthenticity}</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.facilityRegistration.documentAuthenticityDesc}</p>
                    </div>
                  </div>

                  {/* Accept checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <div className="relative flex items-center mt-0.5">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
                      <div className="h-5 w-5 rounded-md border-2 border-neutral-300 peer-checked:border-primary-500 peer-checked:bg-primary-500 transition-all flex items-center justify-center">
                        {agreed && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{t.facilityRegistration.acceptTerms}</span>
                  </label>

                  {/* E-signature */}
                  {agreed && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.facilityRegistration.eSignature}</label>
                      <div className="relative">
                        <PenTool className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                        <input
                          type="text"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder={t.facilityRegistration.eSignaturePlaceholder}
                          className="w-full rounded-xl border-2 border-primary-200 bg-primary-50/30 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all font-medium"
                        />
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">{t.facilityRegistration.typeFacilityName}</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                      <p className="text-sm text-red-600">{t.facilityRegistration.submitError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50"
                >
                  <ArrowBack className="h-4 w-4" />
                  {t.facilityRegistration.back}
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('facilities')}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50"
                >
                  <ArrowBack className="h-4 w-4" />
                  {t.facilityRegistration.backToFacilities}
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.facilityRegistration.next}
                  <ArrowNext className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? t.facilityRegistration.submitting : t.facilityRegistration.submit}
                  {!submitting && <Shield className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
