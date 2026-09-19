import { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  FileText,
  UploadCloud,
  Camera,
  CheckCircle2,
  Shield,
  PenTool,
  ArrowRight,
  ArrowLeft,
  Lock,
  FileCheck,
  AlertTriangle,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type Step = 1 | 2 | 3 | 4;

interface UploadedFile {
  name: string;
  size: number;
}

export function DoctorVerificationPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t, direction } = useApp();
  const ArrowNext = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const ArrowBack = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [idFile, setIdFile] = useState<UploadedFile | null>(null);
  const [licenseFile, setLicenseFile] = useState<UploadedFile | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stepTitles: Record<Step, string> = {
    1: t.verification.step1Title,
    2: t.verification.step2Title,
    3: t.verification.step3Title,
    4: t.verification.step4Title,
  };

  const stepSubtitles: Record<Step, string> = {
    1: t.verification.step1Subtitle,
    2: t.verification.step2Subtitle,
    3: t.verification.step3Subtitle,
    4: t.verification.step4Subtitle,
  };

  const canProceed = (): boolean => {
    if (step === 1) return fullName.trim() !== '' && email.trim() !== '' && licenseNumber.trim() !== '';
    if (step === 2) return idFile !== null && licenseFile !== null;
    if (step === 3) return photoCaptured !== null;
    if (step === 4) return agreed && signature.trim() !== '';
    return false;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setPhotoCaptured(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: UploadedFile | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ name: file.name, size: file.size });
    }
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
    setFullName('');
    setEmail('');
    setPhone('');
    setLicenseNumber('');
    setIdFile(null);
    setLicenseFile(null);
    setPhotoCaptured(null);
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
          <h2 className="mt-5 text-xl font-bold text-neutral-900">{t.verification.submitSuccess}</h2>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{t.verification.submitSuccessDesc}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={() => onNavigate('home')}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
            >
              {t.verification.backToHome}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50"
            >
              {t.verification.title}
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
          <h1 className="text-2xl lg:text-3xl font-bold">{t.verification.title}</h1>
          <p className="mt-2 text-primary-100 text-sm lg:text-base">{t.verification.subtitle}</p>
        </div>
      </div>

      <div className="container-x py-6 lg:py-10">
        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {([1, 2, 3, 4] as Step[]).map((s, idx) => (
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
                  {idx < 3 && (
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
              {/* Step 1: Personal info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.verification.fullName}</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.verification.fullNamePlaceholder}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.verification.email}</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.verification.emailPlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.verification.phone}</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.verification.phonePlaceholder}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.verification.licenseNumber}</label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder={t.verification.licensePlaceholder}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500">{t.verification.uploadDocsDesc}</p>
                  {[
                    { label: t.verification.idDocument, file: idFile, setter: setIdFile },
                    { label: t.verification.licenseDoc, file: licenseFile, setter: setLicenseFile },
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
                          <span className="text-sm font-medium text-neutral-600">{t.verification.uploadHere}</span>
                          <span className="text-xs text-neutral-400">{t.verification.dragDrop}</span>
                          <input type="file" className="sr-only" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => handleFileUpload(e, doc.setter)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Camera face match */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-3">
                    <p className="text-sm text-primary-700 font-medium">{t.verification.cameraFaceMatchDesc}</p>
                  </div>

                  {photoCaptured ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-primary-200">
                        <img src={photoCaptured} alt="Captured" className="w-64 h-64 object-cover" />
                        <div className="absolute top-2 end-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-primary-600">{t.verification.photoCaptured}</p>
                      <button
                        onClick={() => setPhotoCaptured(null)}
                        className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        {t.verification.retake}
                      </button>
                    </div>
                  ) : cameraActive ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl overflow-hidden border-2 border-primary-300">
                        <video ref={videoRef} autoPlay playsInline className="w-64 h-64 object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-56 rounded-full border-2 border-white/60" />
                        </div>
                      </div>
                      <button
                        onClick={capturePhoto}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
                      >
                        <Camera className="h-5 w-5" />
                        {t.verification.capturePhoto}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
                        <Camera className="h-10 w-10 text-neutral-400" />
                      </div>
                      <button
                        onClick={startCamera}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700"
                      >
                        <Camera className="h-5 w-5" />
                        {t.verification.startCamera}
                      </button>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                  <p className="text-xs text-neutral-400 leading-relaxed text-center">{t.verification.faceMatchNote}</p>
                </div>
              )}

              {/* Step 4: Agreement + e-signature */}
              {step === 4 && (
                <div className="space-y-5">
                  {/* Agreement */}
                  <div className="rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary-600" />
                        {t.verification.serviceAgreement}
                      </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
                      <p className="text-sm text-neutral-600 font-medium">{t.verification.agreementIntro}</p>
                      {['agreementClause1', 'agreementClause2', 'agreementClause3', 'agreementClause4', 'agreementClause5'].map((clause, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700 mt-0.5">{idx + 1}</span>
                          <p className="text-sm text-neutral-600 leading-relaxed">{t.verification[clause as keyof typeof t.verification]}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy highlights */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lock className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-bold text-primary-700">{t.verification.confidentiality}</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.verification.confidentialityDesc}</p>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-bold text-red-700">{t.verification.noExternalSharing}</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{t.verification.noExternalSharingDesc}</p>
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
                    <span className="text-sm font-medium text-neutral-700">{t.verification.acceptAgreement}</span>
                  </label>

                  {/* E-signature */}
                  {agreed && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.verification.eSignature}</label>
                      <div className="relative">
                        <PenTool className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400" />
                        <input
                          type="text"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder={t.verification.eSignaturePlaceholder}
                          className="w-full rounded-xl border-2 border-primary-200 bg-primary-50/30 py-3 ps-10 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all font-medium"
                        />
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">{t.verification.typeFullName}</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                      <p className="text-sm text-red-600">{t.verification.submitError}</p>
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
                  {t.verification.back}
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('specialists')}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50"
                >
                  <ArrowBack className="h-4 w-4" />
                  {t.verification.back}
                </button>
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.verification.next}
                  <ArrowNext className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? t.verification.submitting : t.verification.submit}
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
