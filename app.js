import { supabase } from './supabase.ts';

(() => {
  'use strict';

  const root = document.getElementById('app');
  if (!root) return;

  const LANGS = {
    ar: ['العربية', 'rtl'], ru: ['Русский', 'ltr'], uz: ['O‘zbekcha', 'ltr'],
    hy: ['Հايերեն', 'ltr'], tg: ['Тоҷикӣ', 'ltr'], uk: ['Українська', 'ltr'],
    az: ['Azərbaycanca', 'ltr'], ka: ['ქართული', 'ltr']
  };

  const I18N = {
    ar: { home:'الرئيسية', specialists:'الأخصائيون', questions:'الأسئلة والاستشارات', facilities:'المرافق الطبية', pharmacy:'الصيدليات', marketplace:'السوق الطبي', academy:'الأكاديمية', community:'المجتمع', articles:'المقالات', library:'المكتبة', tests:'الاختبارات', dashboard:'لوحتي', admin:'الإدارة', login:'دخول', signup:'تسجيل', ask:'اطرح سؤالاً', search:'بحث', slogan:'منصة سهلة وبسيطة للاستشارات الطبية والنفسية والتعليم المهني' },
    ru: { home:'Главная', specialists:'Специалисты', questions:'Вопросы', facilities:'Медицинские учреждения', pharmacy:'Аптеки', marketplace:'Медицинский рынок', academy:'Академия', community:'Сообщество', articles:'Статьи', library:'Библиотека', tests:'Тесты', dashboard:'Мой кабинет', admin:'Админ', login:'Войти', signup:'Регистрация', ask:'Задать вопрос', search:'Поиск', slogan:'Просто и легко: медицинские консультации и профессиональное обучение' },
    uz: { home:'Bosh sahifa', specialists:'Mutaxassislar', questions:'Savollar', facilities:'Tibbiy markazlar', pharmacy:'Dorixonalar', marketplace:'Tibbiy bozor', academy:'Akademiya', community:'Hamjamiyat', articles:'Maqolalar', library:'Kutubxona', tests:'Testlar', dashboard:'Kabinet', admin:'Admin', login:'Kirish', signup:'Ro‘yxatdan o‘tish', ask:'Savol berish', search:'Qidirish', slogan:'Tibbiy maslahat va ta’lim platformasi' }
  };

  let lang = localStorage.getItem('sb_lang') || 'ar';
  if (!LANGS[lang]) lang = 'ar';
  let currentPath = window.location.hash || '#/';
  let activeUser = null;
  let walletStats = { balance: 0, total_earned: 0 };
  let dbQuestions = [];

  async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    activeUser = user;
    if (activeUser) {
      await fetchLiveWalletData();
      await fetchLiveQuestions();
    }
    render();
  }

  async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { window.toast('خطأ: ' + error.message); return; }
    activeUser = data.user;
    window.location.hash = '#/';
    await init();
  }

  async function fetchLiveWalletData() {
    const { data } = await supabase.rpc('get_platform_stats');
    if (data && data.wallet) {
      walletStats.balance = data.wallet.balance || 0;
      walletStats.total_earned = data.wallet.total_earned || 0;
    }
  }

  async function fetchLiveQuestions() {
    const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (data) dbQuestions = data;
  }

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":''','"':'&quot;'}[ch]));
  const tr = key => (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;

  function header() {
    return `<header class="top" style="background: #1e293b; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
      <a class="logo" href="#/" style="color: white; font-weight: bold; text-decoration: none;">✚ سهل وبسيط</a>
      <nav class="nav" style="display: flex; gap: 15px;">
        <a href="#/" style="color: white;">${esc(tr('home'))}</a>
        <a href="#/questions" style="color: white;">${esc(tr('questions'))}</a>
        <a href="#/dashboard" style="color: white;">${esc(tr('dashboard'))}</a>
      </nav>
      <div>
        <select onchange="window.setLang(this.value)" style="padding: 5px; border-radius: 4px;">
          ${Object.entries(LANGS).map(([k,v]) => `<option value="\${k}" k===lang?'selected':''>{esc(v[0])}</option>`).join('')}
        </select>
        ${activeUser ? `<span style="margin-left:10px;">\${activeUser.email}</span>` : `<a href="#/login" style="color: white; margin-left:10px;">\${esc(tr('login'))}</a>`}
      </div>
    </header>`;
  }

  function viewHome() {
    return `<div style="padding:20px; direction: ${LANGS[lang][1]}; text-align: start;">
      <h2>${esc(tr('slogan'))}</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>🩺 العيادات والأخصائيون</h3><p>استشارات طبية مباشرة ونفسية مع كبار الأطباء.</p><a href="#/specialists">تصفح الأطباء ←</a></div>
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>💊 الصيدلية الرقمية</h3><p>اطلب أدويتك ومستلزماتك الطبية بأسعار تنافسية.</p><a href="#/pharmacy">دخول المتجر ←</a></div>
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>🎓 الأكاديمية والمكتبة</h3><p>كورسات معتمدة في تحليل السلوك ABA وعلم النفس.</p><a href="#/academy">ابدأ التعلم ←</a></div>
      </div>
    </div>`;
  }

  function viewQuestions() {
    return `<div style="padding:20px; direction: ${LANGS[lang][1]}; text-align: start;">
      <h2>📌 الأسئلة والاستشارات الحية الحالية</h2>
      <div style="margin-bottom: 20px;"><a href="#/ask" style="background:#0284c7; color:white; padding:10px 15px; border-radius:5px; text-decoration:none;">${esc(tr('ask'))}</a></div>
      ${dbQuestions.length === 0 ? '<p>لا توجد أسئلة منشورة حالياً، سجل دخولك لرؤية بيانات السيرفر.</p>' : dbQuestions.map(q => `
        <div style="background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:8px; margin-bottom:15px;">
          <h4>\${esc(q.title)}</h4><p style="color:#64748b;">\${esc(q.body)}</p>
          <span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-size:12px;">\${esc(q.status)}</span>
        </div>
      `).join('')}
    </div>`;
  }

  function viewDashboard() {
    return `<div style="padding:20px; direction: ${LANGS[lang][1]}; text-align: start;">
      <h2>💼 لوحة التحكم المالية والشخصية (Dashboard)</h2>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:20px; border-radius:8px; margin:20px 0;">
        <h4>💰 رصيد المحفظة الدفتري الحقيقي (Ledger System):</h4>
        <p>الرصيد المتاح حالياً: <span style="font-size:20px; color:#16a34a; font-weight:bold;">${walletStats.balance} USD</span></p>
        <p>إجمالي الأرباح التراكمية المستلمة: <strong>${walletStats.total_earned} USD</strong></p>
      </div>
    </div>`;
  }

  function viewLogin() {
    return `<div style="padding:40px; max-width:400px; margin: 0 auto; text-align: center;">
      <h2>تسجيل الدخول للمنصة</h2>
      <form onsubmit="event.preventDefault(); window.handleLogin(this.email.value, this.password.value);" style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
        <input type="email" name="email" placeholder="البريد الإلكتروني" required style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <input type="password" name="password" placeholder="كلمة المرور" required style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <button type="submit" style="background:#0284c7; color:white; padding:10px; border:none; border-radius:4px; cursor:pointer;">دخول</button>
      </form>
    </div>`;
  }

  function render() {
    let content = viewHome();
    if (currentPath === '#/questions') content = viewQuestions();
    else if (currentPath === '#/dashboard') content = viewDashboard();
    else if (currentPath === '#/login') content = viewLogin();

    root.innerHTML = `
      ${header()}
      <div style="min-height: 80vh; background:#fafafa;">${content}</div>
    `;
  }

  window.setLang = (next) => { lang = next; localStorage.setItem('sb_lang', next); init(); };
  window.handleLogin = handleLogin;
  window.addEventListener('hashchange', () => { currentPath = window.location.hash; render(); });

  init();
})();
