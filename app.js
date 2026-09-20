import { supabase } from './supabase.ts';

(() => {
  'use strict';

  const root = document.getElementById('app');
  if (!root) return;

  const LANGS = {
    ar: ['العربية', 'rtl'], ru: ['Русский', 'ltr'], uz: ['O‘zbekcha', 'ltr'],
    hy: ['Հայերեն', 'ltr'], tg: ['Тоҷикӣ', 'ltr'], uk: ['Українська', 'ltr'],
    az: ['Azərbaycanca', 'ltr'], ka: ['ქართული', 'ltr']
  };

  const I18N = {
    ar: { home:'الرئيسية', specialists:'الأخصائيون', questions:'الأسئلة والاستشارات', facilities:'المرافق الطبية', pharmacy:'الصيدليات', marketplace:'السوق الطبي', academy:'الأكاديمية', community:'المجتمع', articles:'المقالات', library:'المكتبة', tests:'الاختبارات', dashboard:'لوحتي', admin:'الإدارة', login:'دخول', signup:'تسجيل', ask:'اطرح سؤالاً', search:'بحث', slogan:'منصة سهلة وبسيطة للاستشارات الطبية والنفسية والتعليم المهني' },
    ru: { home:'Главная', specialists:'Специалисты', questions:'Вопросы', facilities:'Медицинские учреждения', pharmacy:'Аптеки', marketplace:'Медицинский рынок', academy:'Академия', community:'Сообщество', articles:'Статьи', library:'Библиотека', tests:'Тесты', dashboard:'Мой кабинет', admin:'Админ', login:'Войти', signup:'Регистрация', ask:'Задать вопрос', search:'Поиск', slogan:'Просто и легко: медицинские консультации и профессиональное обучение' },
    uz: { home:'Bosh sahifa', specialists:'Mutaxassislar', questions:'Savollar', facilities:'Tibbiy markazlar', pharmacy:'Dorixonalar', marketplace:'Tibbiy bozor', academy:'Akademiya', community:'Hamjamiyat', articles:'Maqolalar', library:'Kutubxona', tests:'Testlar', dashboard:'Kabinet', admin:'Admin', login:'Kirish', signup:'Ro‘yxatdan o‘tish', ask:'Savol berish', search:'Qidirish', slogan:'Tibbiy maslahat va ta’lim platformasi' },
    hy: { home:'Գլխավոր', specialists:'Մասնագետներ', questions:'Հարցեր', facilities:'Բժշկական կենترոններ', pharmacy:'Դեղատներ', marketplace:'Բժշկական շուկա', academy:'Ակադեմիա', community:'Համայնք', articles:'Հոդվածներ', library:'Գրադարան', tests:'Թեստեր', dashboard:'Իմ էջը', admin:'Ադմին', login:'Մուտք', signup:'Գրանցվել', ask:'Հարց տալ', search:'Որոնում', slogan:'Բժշկական խորհրդատվության և ուսուցման հարթակ' },
    tg: { home:'Асосӣ', specialists:'Мутахассисон', questions:'Саволҳо', facilities:'Марказҳои тиббӣ', pharmacy:'Дорухонаҳо', marketplace:'Бозори тиббӣ', academy:'Академия', community:'Ҷомеа', articles:'Мақолаҳо', library:'Китобхона', tests:'Санҷишҳо', dashboard:'Кабинет', admin:'Админ', login:'Вуруд', signup:'Бақайдгирӣ', ask:'Савол додан', search:'Ҷустуҷӯ', slogan:'Платформаи машварати тиббӣ ва омӯзиш' },
    uk: { home:'Головна', specialists:'Фахівці', questions:'Запитання', facilities:'Медичні заклади', pharmacy:'Аптеки', marketplace:'Медичний маркетплейс', academy:'Академія', community:'Спільнота', articles:'Статті', library:'Бібліотека', tests:'Тести', dashboard:'Мій кабінет', admin:'Адмін', login:'Увійти', signup:'Реєстрація', ask:'Поставити запитання', search:'Пошук', slogan:'Платформа медичних консультацій та навчання' },
    az: { home:'Ana səhifə', specialists:'Mütəxəssislər', questions:'Suallar', facilities:'Tibb müəssisələri', pharmacy:'Apteklər', marketplace:'Tibbi bazar', academy:'Akademiya', community:'İcma', articles:'Məqalələr', library:'Kitabxana', tests:'Testlər', dashboard:'Kabinetim', admin:'Admin', login:'Daxil ol', signup:'Qeydiyyat', ask:'Sual ver', search:'Axtarış', slogan:'Tibbi məsləhət və təhsil platforması' },
    ka: { home:'მთავარი', specialists:'სპეციალისტები', questions:'კითხვები', facilities:'სამედიცინო დაწესებულებები', pharmacy:'აფთიაქები', marketplace:'სამედიცინო ბაზარი', academy:'აკადემია', community:'საზოგადოება', articles:'სტატიები', library:'ბიბლიოთეკა', tests:'ტესტები', dashboard:'ჩემი კაბინეტი', admin:'ადმინი', login:'შესვლა', signup:'რეგისტრაცია', ask:'კითხვის დასმა', search:'ძიება', slogan:'სამედიცინო კონსულტაციებისა და განათლების პლატფორმა' }
  };

  let lang = localStorage.getItem('sb_lang') || 'ar';
  if (!LANGS[lang]) lang = 'ar';
  let searchTerm = '';
  let activeUser = null;
  let walletStats = { balance: 0, total_earned: 0 };
  let dbQuestions = [];

  // دالة تسجيل الدخول الحقيقية والربط الفوري مع الحسابات الـ 8
  async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      window.toast('خطأ في الدخول: ' + error.message);
      return;
    }
    activeUser = data.user;
    window.toast('تم تسجيل الدخول بنجاح!');
    await fetchLiveWalletData();
    await fetchLiveQuestions();
    render();
  }

  // دالة جلب الرصيد الحقيقي من دالة دفتر الأستاذ السحابية (Ledger System)
  async function fetchLiveWalletData() {
    const { data, error } = await supabase.rpc('get_platform_stats');
    if (!error && data && data.wallet) {
      walletStats.balance = data.wallet.balance || 0;
      walletStats.total_earned = data.wallet.total_earned || 0;
    }
  }

  // دالة جلب الأسئلة الحية التفاعلية من قاعدة البيانات
  async function fetchLiveQuestions() {
    const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      dbQuestions = data;
    }
  }

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":''','"':'&quot;'}[ch]));
  const tr = key => (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;
  const currency = code => ({SAR:'ر.س',RUB:'₽',USD:'\$',EGP:'ج.م'})[code] || code;

  function setLang(next) {
    if (!LANGS[next]) return;
    lang = next;
    localStorage.setItem('sb_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = LANGS[next][1];
    render();
  }

  window.setLang = setLang;
  window.handleLogin = handleLogin;

  // هيكل واجهة المستخدم الرأسية المتصل بالمنصة
  function header() {
    return `<header class="top">
      <div class="bar">
        <a class="logo" href="#/"><span class="mark">✚</span>سهل وبسيط</a>
        <form class="searchForm" onsubmit="return false;"><input class="search" value="${esc(searchTerm)}" placeholder="${esc(tr('search'))}"></form>
        <select class="lang" aria-label="Language" onchange="setLang(this.value)">${Object.entries(LANGS).map(([k,v]) => `<option value="\${k}" k===lang?'selected':''>{esc(v[0])}</option>`).join('')}</select>
        <a class="secondary" href="#/dashboard">${activeUser ? activeUser.email : esc(tr('dashboard'))}</a>
      </div>
    </header>`;
  }

  function render() {
    root.innerHTML = `
      ${header()}
      <main class="content" style="padding: 20px; direction: ${LANGS[lang][1]}; text-align: start;">
        <h1>${esc(tr('slogan'))}</h1>
        <div class="wallet-box" style="background: #eef; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3>💰 محفظتي المالية الحقيقية (Ledger System):</h3>
          <p>الرصيد المتاح: <strong>${walletStats.balance} USD</strong></p>
          <p>إجمالي الأرباح التراكمية: <strong>${walletStats.total_earned} USD</strong></p>
        </div>
        <div class="questions-list">
          <h3>📌 الأسئلة والاستشارات المباشرة من السيرفر:</h3>
          ${dbQuestions.length === 0 ? '<p>لا توجد أسئلة حية حالياً. سجل دخولك لجلب البيانات.</p>' : dbQuestions.map(q => `
            <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
              <h4>\${esc(q.title)}</h4>
              <p>\${esc(q.body)}</p>
              <span style="background: #dfd; padding: 2px 6px; border-radius: 4px;">\${esc(q.status)}</span>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  }

  // بدء تشغيل وتثبيت النظام المحدث تلقائياً
  fetchLiveWalletData().then(() => {
    fetchLiveQuestions().then(() => {
      render();
    });
  });

})();

