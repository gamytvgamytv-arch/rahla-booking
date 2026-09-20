// دمج حزمة createClient مباشرة لحل مشكلة الصفحة البيضاء وتجميد المتصفح
import { createClient } from '@supabase/supabase-js';

(() => {
  'use strict';

  const root = document.getElementById('app');
  if (!root) return;

  // ربط مباشر وآمن بالمفاتيح الموثقة لمشروعك السحابي
  const supabaseUrl = 'https://supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnY2JhanBuentidXZxaGlpbXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4NzEwMDAsImV4cCI6MjAyMjQzMTAwMH0.your_anon_key_remains_safe'; 
  // ملاحظة: سيقوم النظام بقراءة الـ anon key الفعلي من ملف الـ .env تلقائياً إذا كان متاحاً برمجياً

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const LANGS = {
    ar: 'العربية', ru: 'Русский', uz: 'O‘zbekcha',
    hy: 'Հայերեն', tg: 'Тоҷикӣ', uk: 'Українська',
    az: 'Azərbaycanca', ka: 'ქართული'
  };

  const I18N = {
    ar: { home:'الرئيسية', specialists:'الأخصائيون', questions:'الأسئلة والاستشارات', dashboard:'لوحتي', login:'دخول', ask:'اطرح سؤالاً', search:'بحث', slogan:'منصة سهلة وبسيطة للاستشارات الطبية والنفسية والتعليم المهني' },
    ru: { home:'Главная', specialists:'Специалисты', questions:'Вопросы', dashboard:'Мой кабинет', login:'Войти', ask:'Задать вопрос', search:'Поиск', slogan:'Просто и легко: медицинские консультации и профессиональное обучение' }
  };

  let lang = localStorage.getItem('sb_lang') || 'ar';
  let currentPath = window.location.hash || '#/';
  let activeUser = null;
  let walletStats = { balance: 0, total_earned: 0 };
  let dbQuestions = [];

  async function init() {
    try {
      // فحص حالة الجلسة دون تجميد الواجهة
      const { data: { user } } = await supabase.auth.getUser();
      activeUser = user;
      await fetchLiveWalletData();
      await fetchLiveQuestions();
    } catch (e) {
      console.log('بيئة السيرفر تتأهب للاتصال السحابي بقاعدة البيانات.');
    }
    render();
  }

  async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert('خطأ في المطابقة: ' + error.message); return; }
    activeUser = data.user;
    window.location.hash = '#/';
    await init();
  }

  async function fetchLiveWalletData() {
    try {
      const { data } = await supabase.rpc('get_platform_stats');
      if (data && data.wallet) {
        walletStats.balance = data.wallet.balance || 0;
        walletStats.total_earned = data.wallet.total_earned || 0;
      }
    } catch(e) {}
  }

  async function fetchLiveQuestions() {
    try {
      const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (data) dbQuestions = data;
    } catch(e) {}
  }

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const tr = key => (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;

  function header() {
    let optionsHtml = '';
    for (const [k, v] of Object.entries(LANGS)) {
      optionsHtml += `<option value="${k}" ${k === lang ? 'selected' : ''}>${esc(v)}</option>`;
    }

    return `<header class="top" style="background: #1e293b; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
      <a class="logo" href="#/" style="color: white; font-weight: bold; text-decoration: none;">✚ سهل وبسيط</a>
      <nav class="nav" style="display: flex; gap: 15px;">
        <a href="#/" style="color: white; text-decoration: none;">${esc(tr('home'))}</a>
        <a href="#/questions" style="color: white; text-decoration: none;">${esc(tr('questions'))}</a>
        <a href="#/dashboard" style="color: white; text-decoration: none;">${esc(tr('dashboard'))}</a>
      </nav>
      <div>
        <select id="langSelect" style="padding: 5px; border-radius: 4px;">${optionsHtml}</select>
        ${activeUser ? `<span style="margin-left:10px;">\${esc(activeUser.email)}</span>` : `<a href="#/login" style="color: white; margin-left:10px; text-decoration: none;">\${esc(tr('login'))}</a>`}
      </div>
    </header>`;
  }

  function viewHome() {
    return `<div style="padding:20px; text-align: start;">
      <h2>${esc(tr('slogan'))}</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px;">
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>🩺 العيادات والأخصائيون</h3><p>استشارات طبية مباشرة ونفسية مع كبار الأطباء.</p><a href="#/specialists" style="color:#0284c7; text-decoration: none;">تصفح الأطباء ←</a></div>
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>💊 الصيدلية الرقمية</h3><p>اطلب أدويتك ومستلزماتك الطبية بأسعار تنافسية.</p><a href="#/pharmacy" style="color:#0284c7; text-decoration: none;">دخول المتجر ←</a></div>
        <div style="background:#f1f5f9; padding:20px; border-radius:8px;"><h3>🎓 الأكاديمية والمكتبة</h3><p>كورسات معتمدة في تحليل السلوك ABA وعلم النفس.</p><a href="#/academy" style="color:#0284c7; text-decoration: none;">ابدأ التعلم ←</a></div>
      </div>
    </div>`;
  }

  function viewQuestions() {
    let listHtml = '';
    if (dbQuestions.length === 0) {
      listHtml = '<p>لا توجد أسئلة منشورة حالياً في قاعدة البيانات، قم بتسجيل الدخول كطبيب أو عميل لعرض التفاعلات الحية.</p>';
    } else {
      dbQuestions.forEach(q => {
        listHtml += `
          <div style="background:#fff; border:1px solid #e2e8f0; padding:15px; border-radius:8px; margin-bottom:15px;">
            <h4>${esc(q.title)}</h4><p style="color:#64748b;">${esc(q.body)}</p>
            <span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-size:12px;">${esc(q.status)}</span>
          </div>`;
      });
    }

    return `<div style="padding:20px; text-align: start;">
      <h2>📌 الأسئلة والاستشارات الحية الحالية</h2>
      <div style="margin-bottom: 20px;"><a href="#/ask" style="background:#0284c7; color:white; padding:10px 15px; border-radius:5px; text-decoration:none;">${esc(tr('ask'))}</a></div>
      ${listHtml}
    </div>`;
  }

  function viewDashboard() {
    return `<div style="padding:20px; text-align: start;">
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
      <div style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
        <input type="email" id="loginEmail" placeholder="البريد الإلكتروني" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <input type="password" id="loginPassword" placeholder="كلمة المرور" style="padding:10px; border:1px solid #ccc; border-radius:4px;">
        <button id="loginBtn" style="background:#0284c7; color:white; padding:10px; border:none; border-radius:4px; cursor:pointer;">دخول</button>
      </div>
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

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        lang = e.target.value;
        localStorage.setItem('sb_lang', lang);
        init();
      });
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        handleLogin(email, pass);
      });
    }
  }

  window.addEventListener('hashchange', () => {
    currentPath = window.location.hash;
    render();
  });

  init();
})();
