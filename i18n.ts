import type { ReactNode } from 'react';

export type LanguageCode =
  | 'ar'
  | 'ru'
  | 'uz'
  | 'hy'
  | 'tg'
  | 'uk'
  | 'az'
  | 'ka';

export type Direction = 'rtl' | 'ltr';

export interface CountryInfo {
  code: string;
  nameKey: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export interface LanguageInfo {
  code: LanguageCode;
  nameKey: string;
  nativeName: string;
  direction: Direction;
  flag: string;
}

export interface SpecialtySubItem {
  key: string;
  icon: string;
}

export interface SpecialtyCategory {
  key: string;
  icon: string;
  items: SpecialtySubItem[];
}

export interface TranslationData {
  // Navigation
  nav: {
    home: string;
    specialties: string;
    howItWorks: string;
    about: string;
    contact: string;
    blog: string;
    search: string;
    signIn: string;
    signUp: string;
    dashboard: string;
    logout: string;
    profile: string;
    myConsultations: string;
    appointments: string;
    settings: string;
    anonymousMode: string;
    browsingAnonymously: string;
    getDiscount: string;
  };
  // Mega Menu
  mega: {
    children: string;
    mentalHealth: string;
    otherSpecialties: string;
    viewAllSpecialties: string;
    bookConsultation: string;
    sub: Record<string, string>;
  };
  // Hero
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: {
      doctors: string;
      consultations: string;
      satisfaction: string;
      countries: string;
    };
    statDoctors: string;
    statConsultations: string;
    statSatisfaction: string;
    statCountries: string;
  };
  // Features
  features: {
    title: string;
    subtitle: string;
    items: {
      verifiedDoctors: { title: string; desc: string };
      secureConfidential: { title: string; desc: string };
      twentyFourSeven: { title: string; desc: string };
      multilingual: { title: string; desc: string };
      affordablePricing: { title: string; desc: string };
      instantBooking: { title: string; desc: string };
    };
  };
  // How It Works
  howItWorks: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  // Discount Banner
  discount: {
    title: string;
    desc: string;
    cta: string;
    close: string;
  };
  // CTA Section
  cta: {
    title: string;
    subtitle: string;
    button: string;
    secondaryButton: string;
  };
  // Footer
  footer: {
    about: string;
    aboutDesc: string;
    quickLinks: string;
    forPatients: string;
    forDoctors: string;
    contactUs: string;
    followUs: string;
    newsletter: string;
    newsletterDesc: string;
    subscribe: string;
    emailPlaceholder: string;
    rights: string;
    privacy: string;
    terms: string;
    cookies: string;
    faq: string;
    findDoctor: string;
    bookAppointment: string;
    pricing: string;
    joinAsDoctor: string;
    doctorGuide: string;
    email: string;
    phone: string;
    address: string;
    blog: string;
  };
  // Language & Country
  language: {
    selectLanguage: string;
    selectCountry: string;
    region: string;
  };
  // Countries (Arabic-specific)
  countries: Record<string, string>;
  // Questions & Answers
  qa: {
    title: string;
    subtitle: string;
    askQuestion: string;
    searchPlaceholder: string;
    filterAll: string;
    filterFree: string;
    filterPaid: string;
    filterActive: string;
    filterAnswered: string;
    noQuestions: string;
    // Question card
    badgeNew: string;
    badgeUnderReview: string;
    badgeActive: string;
    badgeClosed: string;
    badgeAnswered: string;
    badgeFree: string;
    badgePaid: string;
    votes: string;
    views: string;
    answers: string;
    timeLeft: string;
    expired: string;
    maxAnswers: string;
    by: string;
    // Ask modal
    modalTitle: string;
    step: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    selectSpecialty: string;
    questionTitle: string;
    questionTitlePlaceholder: string;
    questionDetails: string;
    questionDetailsPlaceholder: string;
    yourName: string;
    yourNamePlaceholder: string;
    questionType: string;
    freeQuestion: string;
    paidQuestion: string;
    freeDesc: string;
    paidDesc: string;
    charLimit: string;
    wordLimit: string;
    noFastReply: string;
    selectPlan: string;
    duration: string;
    specialistsNotified: string;
    minAnswersLabel: string;
    maxAnswersLabel: string;
    responseSpeed: string;
    speedStandard: string;
    speedFast: string;
    speedInstant: string;
    featured: string;
    perQuestion: string;
    next: string;
    back: string;
    publish: string;
    publishing: string;
    publishSuccess: string;
    publishError: string;
    days: string;
    specialists: string;
    minAns: string;
    maxAns: string;
    preview: string;
  };
  // Admin pricing dashboard
  admin: {
    title: string;
    subtitle: string;
    addTier: string;
    editTier: string;
    deleteTier: string;
    save: string;
    cancel: string;
    tierName: string;
    tierNameAr: string;
    description: string;
    descriptionAr: string;
    priceUSD: string;
    durationDays: string;
    specialists: string;
    minAnswers: string;
    maxAnswers: string;
    responseSpeed: string;
    active: string;
    inactive: string;
    featured: string;
    sortOrder: string;
    confirmDelete: string;
    saved: string;
    saveError: string;
    priceForCountry: string;
    currency: string;
    backToSite: string;
  };
  // Notifications
  notifications: {
    title: string;
    markAllRead: string;
    noNotifications: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    viewAll: string;
    newBadge: string;
    // Notification messages
    doctorAnswered: string;
    questionVoted: string;
    doctorVerified: string;
    appointmentReminder: string;
    newMessage: string;
  };
  // Quick Access / Bottom Action Cards
  quickAccess: {
    title: string;
    subtitle: string;
    articles: string;
    articlesDesc: string;
    articlesCount: string;
    clinics: string;
    clinicsDesc: string;
    specialists: string;
    specialistsDesc: string;
    specialistsCount: string;
    subscribe: string;
    subscribeDesc: string;
    fromPrice: string;
    explore: string;
    bookNow: string;
    browse: string;
    viewAll: string;
    subscribeNow: string;
  };
  // Health Library
  library: {
    title: string;
    subtitle: string;
    statArticles: string;
    statAuthors: string;
    statReaders: string;
    aiBadge: string;
    // Content type filter
    filterAllTypes: string;
    filterArticle: string;
    filterNews: string;
    filterTip: string;
    // Specialty filter
    filterAllSpecialties: string;
    specMental: string;
    specPediatrics: string;
    specCardio: string;
    specImmunity: string;
    specChronic: string;
    specElderly: string;
    specNutrition: string;
    specDermatology: string;
    specSexology: string;
    // Card
    views: string;
    comments: string;
    engagements: string;
    readMore: string;
    ago: string;
    by: string;
    noResults: string;
    // Admin
    adminTitle: string;
    adminBoost: string;
    adminPin: string;
    adminBoosted: string;
    adminPinned: string;
  };
  // Compounder admin dashboard
  compounder: {
    title: string;
    subtitle: string;
    backToHome: string;
    // Inventory cards
    inventory: string;
    currentCount: string;
    baseCount: string;
    growthRate: string;
    lastRun: string;
    neverRun: string;
    // Growth chart
    growthChart: string;
    weekNum: string;
    // Wallet
    walletBalance: string;
    totalEarned: string;
    totalPayouts: string;
    // Revenue
    revenueTitle: string;
    revenueLast30d: string;
    totalTransactions: string;
    totalGross: string;
    totalNet: string;
    platformOwnedNet: string;
    specialistShare: string;
    sourceType: string;
    description: string;
    grossAmount: string;
    netAmount: string;
    platformOwned: string;
    specialistContent: string;
    date: string;
    // Compound log
    compoundLog: string;
    prevCount: string;
    addedCount: string;
    newCount: string;
    triggeredBy: string;
    runAt: string;
    // Actions
    runNow: string;
    running: string;
    runSuccess: string;
    runSkipped: string;
    runError: string;
    refresh: string;
    autoSchedule: string;
    autoScheduleDesc: string;
    nextRun: string;
    everyMonday: string;
    // Content types
    typeVideos: string;
    typeArticles: string;
    typeCourses: string;
    items: string;
  };
  // Smart Medical Dictionary
  dictionary: {
    title: string;
    subtitle: string;
    backToHome: string;
    searchPlaceholder: string;
    searchBtn: string;
    langAr: string;
    langEn: string;
    langBoth: string;
    results: string;
    noResults: string;
    noResultsDesc: string;
    termCount: string;
    // Term card
    definition: string;
    relatedArticles: string;
    category: string;
    readArticle: string;
    verifiedBy: string;
    // Categories
    catAll: string;
    catMental: string;
    catCardio: string;
    catPediatrics: string;
    catImmunity: string;
    catChronic: string;
    catNeuro: string;
    catDermatology: string;
    catGeneral: string;
  };
  // Medical Reels & Audio Recordings
  reels: {
    title: string;
    subtitle: string;
    backToHome: string;
    tabReels: string;
    tabAudio: string;
    // Reels
    reelsCount: string;
    surgicalOps: string;
    awareness: string;
    protected: string;
    // Card
    views: string;
    duration: string;
    by: string;
    playNow: string;
    listenNow: string;
    // Audio
    audioCount: string;
    recordings: string;
    recordingsDesc: string;
    duration_min: string;
    // Bottom bar
    totalVideos: string;
    totalAudio: string;
    totalViews: string;
    specialistContrib: string;
  };
  // Specialists page
  specialists: {
    title: string;
    subtitle: string;
    // Filters
    filterTitle: string;
    searchPlaceholder: string;
    specialtyCategory: string;
    allCategories: string;
    subSpecialty: string;
    allSpecialties: string;
    sortBy: string;
    sortTopRated: string;
    sortMostAnswers: string;
    sortMostFollowers: string;
    onlineNow: string;
    selectSubSpecialty: string;
    results: string;
    clearFilters: string;
    // Card
    verified: string;
    reputation: string;
    followers: string;
    answers: string;
    perMonth: string;
    follow: string;
    following: string;
    profile: string;
    bookSession: string;
    badgeExpert: string;
    badgeTopRated: string;
    badgeMostReviewed: string;
    badgeOnline: string;
    // Verification banner
    areYouDoctor: string;
    areYouDoctorDesc: string;
    applyForVerification: string;
    // Empty state
    noResults: string;
  };
  // Doctor verification page
  verification: {
    title: string;
    subtitle: string;
    step: string;
    // Step 1: Personal info
    step1Title: string;
    step1Subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    licenseNumber: string;
    licensePlaceholder: string;
    // Step 2: Documents
    step2Title: string;
    step2Subtitle: string;
    uploadDocs: string;
    uploadDocsDesc: string;
    idDocument: string;
    licenseDoc: string;
    uploadHere: string;
    dragDrop: string;
    fileUploaded: string;
    // Step 3: Camera face match
    step3Title: string;
    step3Subtitle: string;
    cameraFaceMatch: string;
    cameraFaceMatchDesc: string;
    startCamera: string;
    capturePhoto: string;
    retake: string;
    photoCaptured: string;
    faceMatchNote: string;
    // Step 4: Agreement
    step4Title: string;
    step4Subtitle: string;
    serviceAgreement: string;
    agreementIntro: string;
    agreementClause1: string;
    agreementClause2: string;
    agreementClause3: string;
    agreementClause4: string;
    agreementClause5: string;
    privacyPolicy: string;
    confidentiality: string;
    confidentialityDesc: string;
    noExternalSharing: string;
    noExternalSharingDesc: string;
    acceptAgreement: string;
    eSignature: string;
    eSignaturePlaceholder: string;
    typeFullName: string;
    // Submit
    submit: string;
    submitting: string;
    submitSuccess: string;
    submitSuccessDesc: string;
    submitError: string;
    next: string;
    back: string;
    backToHome: string;
  };
  // Medical facilities page
  facilities: {
    title: string;
    subtitle: string;
    // Category tabs
    clinics: string;
    labs: string;
    radiology: string;
    rehab: string;
    elderly: string;
    pharmacies: string;
    // Search bar
    searchName: string;
    searchNamePlaceholder: string;
    searchLocation: string;
    searchLocationPlaceholder: string;
    filterType: string;
    allTypes: string;
    minRating: string;
    anyRating: string;
    search: string;
    clearFilters: string;
    results: string;
    // Clinic/hospital card
    available: string;
    rating: string;
    ratingsCount: string;
    nearestAppointment: string;
    bookAppointment: string;
    moreDetails: string;
    // Lab/radiology card
    homeVisit: string;
    resultTime: string;
    resultTimeValue: string;
    bookTest: string;
    testList: string;
    // Coming soon section
    comingSoon: string;
    comingSoonDesc: string;
    registerFacility: string;
    // Empty state
    noResults: string;
  };
  // Facility registration / onboarding page
  facilityRegistration: {
    title: string;
    subtitle: string;
    step: string;
    // Step 1: Institution info
    step1Title: string;
    step1Subtitle: string;
    facilityName: string;
    facilityNamePlaceholder: string;
    facilityType: string;
    facilityTypePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    district: string;
    districtPlaceholder: string;
    contactEmail: string;
    contactEmailPlaceholder: string;
    contactPhone: string;
    contactPhonePlaceholder: string;
    // Step 2: Official documents
    step2Title: string;
    step2Subtitle: string;
    uploadDocsDesc: string;
    commercialLicense: string;
    healthLicense: string;
    uploadHere: string;
    dragDrop: string;
    fileUploaded: string;
    // Step 3: Terms & agreement
    step3Title: string;
    step3Subtitle: string;
    termsTitle: string;
    termsIntro: string;
    term1: string;
    term2: string;
    term3: string;
    term4: string;
    term5: string;
    absoluteLiability: string;
    absoluteLiabilityDesc: string;
    documentAuthenticity: string;
    documentAuthenticityDesc: string;
    acceptTerms: string;
    eSignature: string;
    eSignaturePlaceholder: string;
    typeFacilityName: string;
    // Submit
    submit: string;
    submitting: string;
    submitSuccess: string;
    submitSuccessDesc: string;
    submitError: string;
    next: string;
    back: string;
    backToFacilities: string;
    backToHome: string;
  };
  // Pharmacy e-commerce store
  pharmacyStore: {
    // Store header
    deliveryTime: string;
    deliveryTimeValue: string;
    browseProducts: string;
    backToFacilities: string;
    // Most ordered products section
    mostOrdered: string;
    mostOrderedSubtitle: string;
    // Product categories
    catAll: string;
    catSleep: string;
    catSupplements: string;
    catVitamins: string;
    catPainkillers: string;
    // Product card
    addToCart: string;
    outOfStock: string;
    currency: string;
    // Cart
    cart: string;
    cartEmpty: string;
    cartEmptyDesc: string;
    checkout: string;
    orderTotal: string;
    deliveryFee: string;
    free: string;
    clearCart: string;
    removeItem: string;
    // Checkout / order placement
    deliveryAddress: string;
    deliveryAddressPlaceholder: string;
    placeOrder: string;
    placingOrder: string;
    orderSuccess: string;
    orderSuccessDesc: string;
    orderError: string;
    // Delivery agent system
    agentAssigned: string;
    agentAssignedDesc: string;
    agentName: string;
    agentFee: string;
    platformFee: string;
    latePenalty: string;
    latePenaltyDesc: string;
    close: string;
    continueShopping: string;
  };
  // Smart tracking map and hold/payment system
  tracking: {
    title: string;
    subtitle: string;
    backToStore: string;
    // Map
    pharmacy: string;
    customer: string;
    agent: string;
    // Tracking steps
    stepPreparing: string;
    stepPreparingDesc: string;
    stepPickedUp: string;
    stepPickedUpDesc: string;
    stepOnTheWay: string;
    stepOnTheWayDesc: string;
    stepNearYou: string;
    stepNearYouDesc: string;
    stepDelivered: string;
    stepDeliveredDesc: string;
    // Financial hold
    holdTitle: string;
    holdSubtitle: string;
    orderAmount: string;
    facilityShare: string;
    platformShare: string;
    agentShare: string;
    totalHeld: string;
    holdStatus: string;
    held: string;
    released: string;
    confirmReceipt: string;
    confirming: string;
    receiptConfirmed: string;
    receiptConfirmedDesc: string;
    fundsReleased: string;
    fundsReleasedDesc: string;
    // Profit config panel
    configTitle: string;
    configSubtitle: string;
    shareType: string;
    percentage: string;
    fixed: string;
    mixed: string;
    facilityShareLabel: string;
    platformShareLabel: string;
    agentShareLabel: string;
    saveConfig: string;
    saving: string;
    configSaved: string;
    configError: string;
    previewTitle: string;
    previewDesc: string;
    sampleOrder: string;
    // Pricing requests
    requestsTitle: string;
    requestsSubtitle: string;
    submitRequest: string;
    requesterType: string;
    facility: string;
    agentRole: string;
    requesterName: string;
    requesterNamePlaceholder: string;
    facilityName: string;
    facilityNamePlaceholder: string;
    requestedType: string;
    requestedValue: string;
    requestReason: string;
    requestReasonPlaceholder: string;
    submit: string;
    submitting: string;
    submitSuccess: string;
    submitError: string;
    pending: string;
    approved: string;
    rejected: string;
    approve: string;
    reject: string;
    noRequests: string;
    waitingReview: string;
    close: string;
  };
}

export interface AppContextType {
  language: LanguageCode;
  direction: Direction;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationData;
  isAnonymous: boolean;
  hasSeenDiscount: boolean;
  dismissDiscount: () => void;
  country: CountryInfo;
  setCountry: (country: CountryInfo) => void;
  formatPrice: (priceUSD: number) => string;
}

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  ar: {
    code: 'ar',
    nameKey: 'arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
  ru: {
    code: 'ru',
    nameKey: 'russian',
    nativeName: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺',
  },
  uz: {
    code: 'uz',
    nameKey: 'uzbek',
    nativeName: 'Oʻzbekcha',
    direction: 'ltr',
    flag: '🇺🇿',
  },
  hy: {
    code: 'hy',
    nameKey: 'armenian',
    nativeName: 'Հայերեն',
    direction: 'ltr',
    flag: '🇦🇲',
  },
  tg: {
    code: 'tg',
    nameKey: 'tajik',
    nativeName: 'Тоҷикӣ',
    direction: 'ltr',
    flag: '🇹🇯',
  },
  uk: {
    code: 'uk',
    nameKey: 'ukrainian',
    nativeName: 'Українська',
    direction: 'ltr',
    flag: '🇺🇦',
  },
  az: {
    code: 'az',
    nameKey: 'azerbaijani',
    nativeName: 'Azərbaycanca',
    direction: 'ltr',
    flag: '🇦🇿',
  },
  ka: {
    code: 'ka',
    nameKey: 'georgian',
    nativeName: 'ქართული',
    direction: 'ltr',
    flag: '🇬🇪',
  },
};

export const ARAB_COUNTRIES: CountryInfo[] = [
  { code: 'SA', nameKey: 'saudiArabia', currency: 'SAR', currencySymbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AE', nameKey: 'uae', currency: 'AED', currencySymbol: 'د.إ', flag: '🇦🇪' },
  { code: 'EG', nameKey: 'egypt', currency: 'EGP', currencySymbol: 'ج.م', flag: '🇪🇬' },
  { code: 'IQ', nameKey: 'iraq', currency: 'IQD', currencySymbol: 'ع.د', flag: '🇮🇶' },
  { code: 'JO', nameKey: 'jordan', currency: 'JOD', currencySymbol: 'د.ا', flag: '🇯🇴' },
  { code: 'KW', nameKey: 'kuwait', currency: 'KWD', currencySymbol: 'د.ك', flag: '🇰🇼' },
  { code: 'LB', nameKey: 'lebanon', currency: 'LBP', currencySymbol: 'ل.ل', flag: '🇱🇧' },
  { code: 'LY', nameKey: 'libya', currency: 'LYD', currencySymbol: 'ل.د', flag: '🇱🇾' },
  { code: 'MA', nameKey: 'morocco', currency: 'MAD', currencySymbol: 'د.م', flag: '🇲🇦' },
  { code: 'OM', nameKey: 'oman', currency: 'OMR', currencySymbol: 'ر.ع', flag: '🇴🇲' },
  { code: 'PS', nameKey: 'palestine', currency: 'ILS', currencySymbol: '₪', flag: '🇵🇸' },
  { code: 'QA', nameKey: 'qatar', currency: 'QAR', currencySymbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'SY', nameKey: 'syria', currency: 'SYP', currencySymbol: 'ل.س', flag: '🇸🇾' },
  { code: 'TN', nameKey: 'tunisia', currency: 'TND', currencySymbol: 'د.ت', flag: '🇹🇳' },
  { code: 'YE', nameKey: 'yemen', currency: 'YER', currencySymbol: 'ر.ي', flag: '🇾🇪' },
  { code: 'DZ', nameKey: 'algeria', currency: 'DZD', currencySymbol: 'د.ج', flag: '🇩🇿' },
  { code: 'BH', nameKey: 'bahrain', currency: 'BHD', currencySymbol: 'د.ب', flag: '🇧🇭' },
  { code: 'MR', nameKey: 'mauritania', currency: 'MRU', currencySymbol: 'أ.م', flag: '🇲🇷' },
  { code: 'SD', nameKey: 'sudan', currency: 'SDG', currencySymbol: 'ج.س', flag: '🇸🇩' },
  { code: 'SO', nameKey: 'somalia', currency: 'SOS', currencySymbol: 'S.Sh', flag: '🇸🇴' },
];

// Approximate USD exchange rates for pricing display
export const CURRENCY_RATES: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  EGP: 48.5,
  IQD: 1310,
  JOD: 0.71,
  KWD: 0.31,
  LBP: 89500,
  LYD: 4.85,
  MAD: 9.95,
  OMR: 0.39,
  ILS: 3.7,
  QAR: 3.64,
  SYP: 13000,
  TND: 3.1,
  YER: 250,
  DZD: 134,
  BHD: 0.38,
  MRU: 39.5,
  SDG: 550,
  SOS: 570,
};

export const SPECIALTIES: SpecialtyCategory[] = [
  {
    key: 'children',
    icon: 'Baby',
    items: [
      { key: 'pediatricsNeonatal', icon: 'BabyIcon' },
      { key: 'behaviorModification', icon: 'Brain' },
      { key: 'speechLearning', icon: 'Languages' },
      { key: 'denverMethod', icon: 'Ruler' },
      { key: 'sensoryMotor', icon: 'Activity' },
    ],
  },
  {
    key: 'mentalHealth',
    icon: 'Brain',
    items: [
      { key: 'psychiatrist', icon: 'Stethoscope' },
      { key: 'psychotherapist', icon: 'HeartHandshake' },
      { key: 'psychologist', icon: 'BrainCircuit' },
      { key: 'neuropsychRehab', icon: 'Network' },
      { key: 'abaTherapy', icon: 'LineChart' },
      { key: 'psychoanalysis', icon: 'BrainCog' },
      { key: 'sleepDisorders', icon: 'Moon' },
      { key: 'anxietyPhobiaOcd', icon: 'Wind' },
    ],
  },
  {
    key: 'otherSpecialties',
    icon: 'Stethoscope',
    items: [
      { key: 'generalInternal', icon: 'Thermometer' },
      { key: 'cardiology', icon: 'HeartPulse' },
      { key: 'dermatology', icon: 'Sparkles' },
      { key: 'orthopedics', icon: 'Bone' },
      { key: 'neurology', icon: 'Brain' },
      { key: 'immunology', icon: 'Shield' },
      { key: 'geriatrics', icon: 'Accessibility' },
      { key: 'carpix', icon: 'Camera' },
    ],
  },
];
