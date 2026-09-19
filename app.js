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
    hy: { home:'Գլխավոր', specialists:'Մասնագետներ', questions:'Հարցեր', facilities:'Բժշկական կենտրոններ', pharmacy:'Դեղատներ', marketplace:'Բժշկական շուկա', academy:'Ակադեմիա', community:'Համայնք', articles:'Հոդվածներ', library:'Գրադարան', tests:'Թեստեր', dashboard:'Իմ էջը', admin:'Ադմին', login:'Մուտք', signup:'Գրանցվել', ask:'Հարց տալ', search:'Որոնում', slogan:'Բժշկական խորհրդատվության և ուսուցման հարթակ' },
    tg: { home:'Асосӣ', specialists:'Мутахассисон', questions:'Саволҳо', facilities:'Марказҳои тиббӣ', pharmacy:'Дорухонаҳо', marketplace:'Бозори тиббӣ', academy:'Академия', community:'Ҷомеа', articles:'Мақолаҳо', library:'Китобхона', tests:'Санҷишҳо', dashboard:'Кабинет', admin:'Админ', login:'Вуруд', signup:'Бақайдгирӣ', ask:'Савол додан', search:'Ҷустуҷӯ', slogan:'Платформаи машварати тиббӣ ва омӯзиш' },
    uk: { home:'Головна', specialists:'Фахівці', questions:'Запитання', facilities:'Медичні заклади', pharmacy:'Аптеки', marketplace:'Медичний маркетплейс', academy:'Академія', community:'Спільнота', articles:'Статті', library:'Бібліотека', tests:'Тести', dashboard:'Мій кабінет', admin:'Адмін', login:'Увійти', signup:'Реєстрація', ask:'Поставити запитання', search:'Пошук', slogan:'Платформа медичних консультацій та навчання' },
    az: { home:'Ana səhifə', specialists:'Mütəxəssislər', questions:'Suallar', facilities:'Tibb müəssisələri', pharmacy:'Apteklər', marketplace:'Tibbi bazar', academy:'Akademiya', community:'İcma', articles:'Məqalələr', library:'Kitabxana', tests:'Testlər', dashboard:'Kabinetim', admin:'Admin', login:'Daxil ol', signup:'Qeydiyyat', ask:'Sual ver', search:'Axtarış', slogan:'Tibbi məsləhət və təhsil platforması' },
    ka: { home:'მთავარი', specialists:'სპეციალისტები', questions:'კითხვები', facilities:'სამედიცინო დაწესებულებები', pharmacy:'აფთიაქები', marketplace:'სამედიცინო ბაზარი', academy:'აკადემია', community:'საზოგადოება', articles:'სტატიები', library:'ბიბლიოთეკა', tests:'ტესტები', dashboard:'ჩემი კაბინეტი', admin:'ადმინი', login:'შესვლა', signup:'რეგისტრაცია', ask:'კითხვის დასმა', search:'ძიება', slogan:'სამედიცინო კონსულტაციებისა და განათლების პლატფორმა' }
  };

  let lang = localStorage.getItem('sb_lang') || 'ar';
  if (!LANGS[lang]) lang = 'ar';
  let megaOpen = false;
  let noticeOpen = false;
  let searchTerm = '';
  let specialistOnlineOnly = false;

  const specialists = [
    {name:'د. جيمي حسن', specialty:'الطب النفسي', rating:4.9, reputation:'18.8k', followers:4800, answers:1023, price:60, currency:'SAR', online:true, icon:'🧠'},
    {name:'أ. ليلى أحمد', specialty:'ABA وتحليل السلوك', rating:4.8, reputation:'14.2k', followers:3200, answers:875, price:45, currency:'SAR', online:true, icon:'🧩'},
    {name:'Д. Андрей Петров', specialty:'Нейропсихология', rating:4.7, reputation:'11.6k', followers:2100, answers:641, price:900, currency:'RUB', online:false, icon:'🔬'}
  ];
  const questions = [
    {title:'ما أعراض القلق التي تستدعي استشارة؟', specialty:'الصحة النفسية', status:'جديد', votes:24, views:341, price:20, currency:'SAR', days:3, maxAnswers:10},
    {title:'كيف يمكن بناء خطة مهارات لطفل؟', specialty:'ABA', status:'نشط', votes:18, views:219, price:0, currency:'SAR', days:7, maxAnswers:5},
    {title:'Какие упражнения помогают памяти?', specialty:'Нейропсихология', status:'نشط', votes:31, views:512, price:100, currency:'RUB', days:5, maxAnswers:15}
  ];
  const courses = [
    {title:'ABA Foundation', category:'ABA', duration:'8 أسابيع', price:149, progress:35},
    {title:'CBT Foundation', category:'КПТ', duration:'6 أسابيع', price:129, progress:0},
    {title:'Neuropsychology Basics', category:'Нейропсихология', duration:'10 أسابيع', price:199, progress:12},
    {title:'Family Therapy Basics', category:'العلاج الأسري', duration:'5 أسابيع', price:99, progress:0}
  ];
  const departments = ['الأطفال','الصحة النفسية','تخصصات طبية أخرى','ABA','Нейропсихология','КПТ','العلاج الأسري','الأشعة','التحاليل','الصيدليات'];

  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const tr = key => (I18N[lang] && I18N[lang][key]) || I18N.ar[key] || key;
  const currency = code => ({SAR:'ر.س',RUB:'₽',USD:'$',EGP:'ج.م'})[code] || code;
  const toast = message => {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  };

  function navigate(path) { window.location.hash = path; }
  function setLang(next) {
    if (!LANGS[next]) return;
    lang = next;
    localStorage.setItem('sb_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = LANGS[next][1];
    render();
  }
  window.toast = toast;
  window.setLang = setLang;
  window.navigate = navigate;

  function header() {
    return `<header class="top">
      <div class="bar">
        <a class="logo" href="#/"><span class="mark">✚</span>سهل وبسيط</a>
        <form class="searchForm" onsubmit="return submitSearch(event)"><input class="search" value="${esc(searchTerm)}" aria-label="${esc(tr('search'))}" placeholder="${esc(tr('search'))}"></form>
        <select class="lang" aria-label="Language" onchange="setLang(this.value)">${Object.entries(LANGS).map(([k,v]) => `<option value="${k}" ${k===lang?'selected':''}>${esc(v[0])}</option>`).join('')}</select>
        <button class="icon" type="button" onclick="toggleNotifications()" aria-label="الإشعارات">🔔<span class="dot"></span></button>
        <a class="secondary" href="#/login">${esc(tr('login'))}</a>
        <a class="primary" href="#/signup">${esc(tr('signup'))}</a>
      </div>
      <nav class="nav" aria-label="Main navigation">
        <a href="#/">${esc(tr('home'))}</a>
        <button type="button" onclick="toggleMega()">${esc(tr('specialists'))} ▾</button>
        <a href="#/questions">${esc(tr('questions'))}</a>
        <a href="#/facilities">${esc(tr('facilities'))}</a>
        <a href="#/pharmacy">${esc(tr('pharmacy'))}</a>
        <a href="#/academy">${esc(tr('academy'))}</a>
        <a href="#/community">${esc(tr('community'))}</a>
        <a href="#/articles">${esc(tr('articles'))}</a>
        <a href="#/library">${esc(tr('library'))}</a>
        <a href="#/tests">${esc(tr('tests'))}</a>
        <a href="#/marketplace">${esc(tr('marketplace'))}</a>
        <a href="#/dashboard">${esc(tr('dashboard'))}</a>
      </nav>
      ${megaOpen ? megaMenu() : ''}
      ${noticeOpen ? notifications() : ''}
    </header>`;
  }

  window.submitSearch = event => {
    event.preventDefault();
    searchTerm = event.target.querySelector('input').value.trim();
    navigate('#/search');
    return false;
  };
  window.toggleMega = () => { megaOpen = !megaOpen; noticeOpen = false; render(); };
  window.toggleNotifications = () => { noticeOpen = !noticeOpen; megaOpen = false; render(); };

  function megaMenu() {
    return `<div class="mega"><div><h4>🧒 الأطفال</h4><p>طب الأطفال والمواليد</p><p>تعديل السلوك</p><p>التخاطب وصعوبات التعلم</p><p>دانفر والتكامل الحسي</p></div><div><h4>🧠 الصحة النفسية</h4><p>طبيب نفسي</p><p>معالج نفسي</p><p>أخصائي نفسي</p><p>ABA · التحليل النفسي</p><p>النوم والقلق والوسواس</p></div><div><h4>🩺 تخصصات طبية أخرى</h4><p>الطب العام والباطنة</p><p>القلب والأوعية</p><p>الجلدية والتجميل</p><p>العظام والأعصاب والمناعة</p></div><div><h4>🛒 الخدمات</h4><p>العيادات · التحاليل · الأشعة</p><p>الصيدليات والتوصيل</p><p>السوق الطبي</p><p>الأكاديمية والكتب</p></div></div>`;
  }
  function notifications() {
    return `<div class="notifications"><div><b>الإشعارات</b><button type="button" class="linkBtn" onclick="closeNotifications()">إغلاق</button></div><div class="notice">💚 تم تحديث رصيد المحفظة.</div><div class="notice">💬 تمت الإجابة عن سؤالك.</div><div class="notice">✓ تم التحقق من حساب أحد الأخصائيين.</div></div>`;
  }
  window.closeNotifications = () => { noticeOpen = false; render(); };

  function page(title, sub, body) {
    return `<div class="wrap"><div class="pageTitle"><div><span class="eyebrow">منصة سهلة وبسيطة</span><h1>${esc(title)}</h1><p>${esc(sub || '')}</p></div><a class="secondary" href="#/">← ${esc(tr('home'))}</a></div>${body}</div>`;
  }

  function specialistCards(items = specialists) {
    return items.map((s, index) => `<article class="card sp">
      <div class="spTop"><div class="avatarLarge">${s.icon}</div><div><h3>${esc(s.name)} <span class="verified">✓</span></h3><small>${esc(s.specialty)}</small><small>★ ${s.rating} · موثق ${s.online ? '· متصل الآن' : ''}</small></div></div>
      <p>استشارات ومتابعة عن بعد، مع صفحة ملف قابلة للتوسع وربط المواعيد والدفع لاحقاً.</p>
      <div class="stats"><div><b>${esc(s.reputation)}</b><span>سمعة</span></div><div><b>${s.followers.toLocaleString()}</b><span>متابع</span></div><div><b>${s.answers.toLocaleString()}</b><span>إجابة</span></div></div>
      <div class="price">${s.price} ${currency(s.currency)} / جلسة</div>
      <div class="actions"><button class="secondary" type="button" onclick="toast('تمت إضافة الأخصائي إلى المتابعة')">متابعة</button><button class="primary" type="button" onclick="toast('صفحة الملف التجريبية للأخصائي ${index + 1}')">الملف</button></div>
    </article>`).join('');
  }

  function questionCards(items = questions) {
    if (!items.length) return `<div class="empty card">لا توجد نتائج مطابقة.</div>`;
    return items.map(q => `<article class="card q"><span class="tag">${esc(q.status)}</span><small>${esc(q.specialty)}</small><h3>${esc(q.title)}</h3><p>تصويت ${q.votes} · مشاهدة ${q.views} · حتى ${q.maxAnswers} إجابات</p><div class="qfoot"><b>${q.price ? `${q.price} ${currency(q.currency)}` : 'مجاني'}</b><span>⏱ ${q.days} أيام</span></div></article>`).join('');
  }
  function courseCards() {
    return courses.map(c => `<article class="card course"><span class="tag">${esc(c.category)}</span><h3>${esc(c.title)}</h3><p>دورة تجريبية قابلة للربط بالفيديو والملفات والاختبار والشهادة.</p><small>${esc(c.duration)} · 3 وحدات · 9 دروس</small><div class="progress"><i style="width:${Math.max(0, Math.min(100, c.progress))}%"></i></div><button class="primary" type="button" onclick="toast('${c.progress ? 'متابعة الدورة' : 'فتح الدورة'}')">${c.progress ? 'متابعة' : 'فتح الدورة'}</button></article>`).join('');
  }

  function home() {
    return `<div class="wrap"><section class="hero"><div><span class="eyebrow">✦ نسخة تجريبية قابلة للتطوير</span><h1>${esc(tr('slogan'))}</h1><p>اسأل مختصاً، احجز جلسة، اكتشف المرافق والصيدليات، وتعلّم في أكاديمية مهنية واحدة.</p><div class="heroBtns"><a class="primary" href="#/questions">${esc(tr('ask'))}</a><a class="secondary" href="#/specialists">${esc(tr('specialists'))}</a></div><div class="trust">✓ توثيق · ✓ 8 لغات · ✓ تصفح مجهول · ✓ خصم 10% لأول تسجيل</div></div><div class="heroCard"><b>🛡️ حماية الحسابات</b><div class="big">18,700+</div><p>رقم تجريبي؛ سيتم استبداله ببيانات قاعدة البيانات عند الربط.</p><div class="progress"><i style="width:72%"></i></div><small>واجهة جاهزة للـ Backend</small></div></section><div class="quickGrid"><a class="card quick" href="#/articles"><b>+350,000</b><span>${esc(tr('articles'))}</span></a><a class="card quick" href="#/facilities"><b>حجز فوري</b><span>${esc(tr('facilities'))}</span></a><a class="card quick" href="#/specialists"><b>+18,700</b><span>${esc(tr('specialists'))}</span></a><a class="card quick" href="#/academy"><b>من 49</b><span>اشترك الآن</span></a></div><section class="section"><div class="head"><h2>التخصصات الرئيسية</h2></div><div class="grid4">${departments.map((x,i)=>`<a class="card quick" href="#/specialists"><span class="deptIcon">${['🧒','🧠','🩺','🧩','🔬','💬','👨‍👩‍👧','🩻','🧪','💊'][i]}</span><span>${esc(x)}</span></a>`).join('')}</div></section><section class="section"><div class="head"><h2>أخصائيون متصلون الآن</h2><a href="#/specialists">عرض الكل →</a></div><div class="grid">${specialistCards(specialists.filter(s=>s.online))}</div></section><section class="section"><div class="head"><h2>أسئلة واستشارات</h2><a href="#/questions">عرض الكل →</a></div><div class="grid">${questionCards()}</div></section><section class="section"><div class="head"><h2>الأكاديمية</h2><a href="#/academy">عرض الكل →</a></div><div class="grid4">${courseCards()}</div></section></div>`;
  }

  function specialistsPage() {
    const filtered = specialists.filter(s => (!specialistOnlineOnly || s.online) && (!searchTerm || `${s.name} ${s.specialty}`.toLowerCase().includes(searchTerm.toLowerCase())));
    return page(tr('specialists'),'بطاقات موحدة، تحقق، تقييمات، أسعار وفلاتر',`<div class="filters"><input value="${esc(searchTerm)}" oninput="updateSpecialistSearch(this.value)" placeholder="${esc(tr('search'))}"><select onchange="toast('تم تحديث الترتيب')"><option>الأعلى تقييماً</option><option>الأكثر إجابة</option></select><label class="check"><input type="checkbox" ${specialistOnlineOnly?'checked':''} onchange="toggleOnline(this.checked)"> المتصلون الآن فقط</label></div><div class="grid">${specialistCards(filtered)}</div><div class="banner"><div><h2>هل أنت طبيب أو أخصائي؟</h2><p>التوثيق يتطلب وثائق رسمية وتوقيع الاتفاقية قبل التفعيل.</p></div><a class="primary" href="#/verification">التقدم للتوثيق</a></div>`);
  }
  window.updateSpecialistSearch = value => { searchTerm = value; render(); };
  window.toggleOnline = value => { specialistOnlineOnly = Boolean(value); render(); };

  function questionsPage() {
    return page(tr('questions'),'أسئلة مجانية ومدفوعة مع شرائح ديناميكية',`<div class="card"><div class="steps"><b class="active">1. التخصص</b><b>2. التفاصيل</b><b>3. التسعير</b></div><div class="choices">${departments.map(x=>`<button type="button" onclick="selectSpecialty('${x.replace(/'/g,"\\'")}')">${esc(x)}</button>`).join('')}</div><hr><form class="form" onsubmit="return createQuestion(event)"><input name="title" required maxlength="140" placeholder="عنوان السؤال"><textarea name="body" required placeholder="اكتب تفاصيل السؤال..."></textarea><div><button type="button" class="secondary" onclick="selectQuestionType('free')">سؤال مجاني</button> <button type="button" class="primary" onclick="selectQuestionType('paid')">سؤال مدفوع</button></div><input type="hidden" name="type" id="questionType" value="free"><button class="primary" type="submit">نشر السؤال التجريبي</button></form><div class="pricing" style="margin-top:15px"><div class="card"><b>أساسي</b><p>3 أيام · 5 أخصائيين · حتى 5 إجابات</p><strong>20 SAR</strong></div><div class="card selected"><b>استجابة سريعة</b><p>24 ساعة · 15 أخصائياً · حتى 15 إجابة</p><strong>60 SAR</strong></div></div></div><section class="section"><div class="head"><h2>قائمة الأسئلة</h2></div><div class="grid">${questionCards()}</div></section>`);
  }
  window.selectSpecialty = x => toast(`تم اختيار: ${x}`);
  window.selectQuestionType = type => { const el=document.getElementById('questionType'); if(el) el.value=type; toast(type==='paid'?'تم اختيار السؤال المدفوع':'تم اختيار السؤال المجاني'); };
  window.createQuestion = event => { event.preventDefault(); const form=event.target; const title=form.title.value.trim(); if(!title) return false; questions.unshift({title, specialty:'غير محدد', status:'جديد', votes:0, views:0, price:form.type.value==='paid'?20:0, currency:'SAR', days:3, maxAnswers:5}); toast('تم إنشاء السؤال في النسخة التجريبية'); navigate('#/questions'); return false; };

  function facilities() { const fs=[['مركز النور الطبي','عيادة','الرياض','العليا','4.8','غداً 10:00','🏥'],['مختبر الحياة','تحاليل','القاهرة','مدينة نصر','4.6','اليوم 18:30','🧪'],['عيادات الصحة النفسية','مركز تأهيل','دبي','البرشاء','4.9','بعد غد 12:00','🧠']]; return page(tr('facilities'),'عيادات، تحاليل، أشعة، تأهيل، دور مسنين وصيدليات',`<div class="filters"><input placeholder="اسم المؤسسة / المدينة / الحي"><select><option>كل الأنواع</option><option>عيادة</option><option>تحاليل</option></select><select><option>أعلى تقييم</option></select></div><div class="grid">${fs.map(f=>`<article class="card facility"><div class="facilityArt">${f[6]}</div><span class="tag">متاح</span><h3>${esc(f[0])}</h3><p>📍 ${esc(f[2])} · ${esc(f[3])}</p><p>★ ${f[4]} · أقرب موعد: <b>${esc(f[5])}</b></p><div class="actions"><button class="secondary" type="button" onclick="toast('التفاصيل ستكون متاحة بعد ربط قاعدة البيانات')">التفاصيل</button><button class="primary" type="button" onclick="toast('تم فتح نموذج الحجز التجريبي')">احجز موعداً</button></div></article>`).join('')}</div><div class="banner"><div><h2>سجّل مؤسستك</h2><p>تحقق رقمي وتعاقد إلكتروني ومراجعة إدارية.</p></div><a class="primary" href="#/verification">تسجيل المؤسسة</a></div>`); }
  function academy() { return page(tr('academy'),'دورات، دروس، ملفات، اختبارات وشهادات إتمام',`<div class="grid4">${courseCards()}</div><div class="banner"><div><h2>متجر الكتب والمكتبة</h2><p>هيكل جاهز للمحتوى المرخص والمفتوح لكل تخصص.</p></div><a class="primary" href="#/library">فتح المكتبة</a></div>`); }
  function community() { return page(tr('community'),'ملفات شخصية، منشورات، مجموعات، دردشة ورسائل',`<div class="two"><div class="card"><div class="post"><div class="avatar">ج</div><div><b>مجتمع الأخصائيين</b><p>نقاش حول جمع البيانات في ABA.</p><small>♥ 24 · 💬 8 · منذ ساعتين</small></div></div><div class="post"><div class="avatar">ل</div><div><b>مجموعة علم النفس</b><p>شاركوا مصادر مرخصة للتعلم والتدريب.</p><small>♥ 41 · 💬 12 · أمس</small></div></div></div><div class="card"><h3>غرف المجتمع</h3>${departments.slice(0,6).map(x=>`<div class="row">💬 ${esc(x)}<b>›</b></div>`).join('')}<button class="primary" type="button" style="width:100%;margin-top:10px" onclick="toast('سيتم فتح محرر المنشور بعد ربط الحساب')">إنشاء منشور</button></div></div>`); }
  function articles() { return page(tr('articles'),'محتوى تجريبي — استبدله بمواد تملك حقوق استخدامها',`<div class="grid">${['مهارات التواصل مع العميل','أساسيات جمع البيانات','مقدمة في الصحة النفسية'].map(x=>`<article class="card"><div class="productIcon">📚</div><span class="tag">مقال أصلي</span><h3>${esc(x)}</h3><p>نص تجريبي قصير قابل للاستبدال من لوحة الإدارة.</p><button class="linkBtn" type="button" onclick="toast('صفحة المقال ستكون متاحة في الإصدار المتصل')">قراءة المقال →</button></article>`).join('')}</div>`); }
  function library() { return page(tr('library'),'مكتبة عامة ومكتبات مرتبطة بالتخصصات والدورات',`<div class="library">${['ABA: دليل تمهيدي مرخص','Нейропсихология: أساسيات الانتباه والذاكرة','العلاج الأسري: ملاحظات تدريبية','CBT: نموذج معرفي مختصر'].map(x=>`<div class="card row"><div>📖 <b>${esc(x)}</b><p>PDF / مادة تعليمية · حقوق الاستخدام محددة</p></div><button class="secondary" type="button" onclick="toast('سيتم فتح المادة بعد إضافة التخزين')">فتح</button></div>`).join('')}</div>`); }
  function tests() { return page(tr('tests'),'اختبارات تدريبية، بنك أسئلة ونتائج',`<div class="grid">${['ABA Foundation Test','CBT Foundation Test','Neuropsychology Basics Test'].map((x,i)=>`<article class="card"><span class="tag">${i+1}0 أسئلة</span><h3>${x}</h3><p>اختبار تجريبي مع نتيجة ومحاولات قابلة للربط بقاعدة البيانات.</p><button class="primary" type="button" onclick="toast('تم فتح الاختبار التجريبي')">بدء الاختبار</button></article>`).join('')}</div>`); }
  function marketplace() { return page(tr('marketplace'),'بيع وتأجير أجهزة ومؤسسات طبية مع فصل الوساطة عن إتمام الصفقة',`<div class="warning">تنويه: إدارة الموقع وسيط إعلاني فقط في إعلانات البيع، وعلى المشتري التحقق من التراخيص والوثائق وعدم تحويل أموال خارج المنصة.</div><div class="market"><article class="card product"><div class="productIcon">🩺</div><h3>جهاز قياس ضغط</h3><p>بيع · حالة جيدة</p><strong>250 SAR</strong><button class="primary" type="button" style="width:100%" onclick="toast('تم فتح التواصل التجريبي')">تواصل</button></article><article class="card product"><div class="productIcon">🏥</div><h3>عيادة مجهزة للإيجار</h3><p>إيجار · دردشة داخلية</p><strong>2,500 SAR / شهر</strong><button class="primary" type="button" style="width:100%" onclick="toast('تم فتح التفاصيل التجريبية')">التفاصيل</button></article><article class="card product"><div class="productIcon">💊</div><h3>صيدلية</h3><p>توصيل 30–45 دقيقة</p><a class="primary" style="width:100%" href="#/pharmacy">فتح الصيدلية</a></article></div>`); }
  function pharmacy() { return page(tr('pharmacy'),'متجر منتجات قابل للربط بالمخزون والمندوب والتتبع الحي',`<div class="card banner" style="margin:0 0 15px"><div><h2>صيدلية الإيمان</h2><p>★ 4.8 · التوصيل 30–45 دقيقة</p></div><button class="primary" type="button" onclick="toast('تم فتح المنتجات')">تصفح المنتجات</button></div><div class="grid4">${['فيتامينات','مكملات','النوم','مسكنات'].map((x,i)=>`<article class="card product"><div class="productIcon">${['💊','🧴','🌙','🩹'][i]}</div><span class="tag">${x}</span><h3>منتج تجريبي</h3><p>الاسم والجرعة بالعربية والإنجليزية</p><strong>${[48,72,35,28][i]} SAR</strong><button class="primary" type="button" style="width:100%" onclick="toast('تمت إضافة المنتج إلى السلة التجريبية')">+ سلة</button></article>`).join('')}</div>`); }
  function dashboard() { return page(tr('dashboard'),'محفظة، نقاط، جلسات، دورات وإشعارات',`<div class="dashboard"><div class="card stat"><b>💰</b><div><span>المحفظة</span><b>1,250 SAR</b></div></div><div class="card stat"><b>⭐</b><div><span>النقاط</span><b>420</b></div></div><div class="card stat"><b>🎥</b><div><span>جلسات قادمة</span><b>3</b></div></div><div class="card stat"><b>📚</b><div><span>دورات نشطة</span><b>4</b></div></div></div><div class="two" style="margin-top:15px"><div class="card"><h3>التقدم الدراسي</h3>${courses.map(c=>`<div class="row"><span>${esc(c.title)}</span><b>${c.progress}%</b></div><div class="progress"><i style="width:${c.progress}%"></i></div>`).join('')}</div><div class="card"><h3>الإشعارات الخاصة</h3><p>💚 تم تحديث المحفظة.</p><p>📅 لديك جلسة فيديو غداً.</p><p>✓ تم حفظ دورة.</p></div></div>`); }
  function admin() { return page(tr('admin'),'إدارة الأسعار والمحتوى والمستخدمين والتقارير',`<div class="dashboard"><div class="card stat"><b>👥</b><div><span>المستخدمون</span><b>24,870</b></div></div><div class="card stat"><b>🏥</b><div><span>المؤسسات</span><b>1,240</b></div></div><div class="card stat"><b>🛒</b><div><span>الطلبات</span><b>8,430</b></div></div><div class="card stat"><b>📈</b><div><span>إيرادات تجريبية</span><b>125k</b></div></div></div><div class="two" style="margin-top:15px"><div class="card"><h3>وحدات الإدارة</h3>${['التسعير حسب الدولة والعملة','التخصصات','المقالات والمكتبة','التوثيق والعقود','الشكاوى والتعويضات','نسب المنصة والمؤسسة والتوصيل','المستخدمون والأدوار','النسخ الاحتياطية'].map(x=>`<div class="row"><span>${esc(x)}</span><b>›</b></div>`).join('')}</div><div class="card"><h3>مساعد الإدارة</h3><p>ملخص إحصائي · اقتراح تصنيفات · كشف التكرار · تقارير.</p><div class="ai">AI Assistant — Sandbox</div></div></div>`); }
  function verification() { return page('التوثيق والتعاقد','مسار تجريبي — لا ترفع وثائق حقيقية إلى هذه النسخة',`<div class="card" style="max-width:760px;margin:auto">${['البيانات الأساسية','رفع الوثائق','مطابقة الهوية','التوقيع الإلكتروني','مراجعة الإدارة'].map((x,i)=>`<div class="verifyStep"><span>${i+1}</span><div><b>${x}</b><p>${i===1?'PDF/JPG حتى 10MB في الإنتاج':i===2?'سيتم ربط مزود KYC لاحقاً':'خطوة تجريبية'}</p></div><b>↑</b></div>`).join('')}<button class="primary" type="button" style="margin-top:15px" onclick="toast('تم إرسال الطلب في النسخة التجريبية')">إرسال للمراجعة</button></div>`); }
  function auth(mode='signup') { const login = mode === 'login'; return page(login ? tr('login') : tr('signup'), login ? 'واجهة دخول تجريبية — اربطها بـ Supabase Auth قبل الإنتاج' : 'سيظهر خصم 10% لأول تسجيل وفق سياسة المنصة',`<form class="card auth" onsubmit="return ${login ? 'loginSubmit' : 'signup'}(event)"><input name="email" required type="email" placeholder="البريد الإلكتروني"><input name="password" required minlength="6" type="password" placeholder="كلمة المرور">${login ? '' : '<input name="name" required placeholder="الاسم الكامل"><select name="role"><option>عميل</option><option>أخصائي</option><option>مؤسسة</option></select><label><input name="terms" required type="checkbox"> أوافق على الشروط والخصوصية</label>'}<button class="primary" type="submit">${login ? 'دخول تجريبي' : 'إنشاء الحساب والحصول على خصم 10%'}</button></form>`); }
  window.signup = event => { event.preventDefault(); toast('تم إنشاء الحساب التجريبي بنجاح'); navigate('#/dashboard'); return false; };
  window.loginSubmit = event => { event.preventDefault(); toast('تم تسجيل الدخول التجريبي بنجاح'); navigate('#/dashboard'); return false; };

  function searchPage() {
    const q = searchTerm.toLowerCase();
    const s = specialists.filter(x => `${x.name} ${x.specialty}`.toLowerCase().includes(q));
    const qs = questions.filter(x => `${x.title} ${x.specialty}`.toLowerCase().includes(q));
    return page('نتائج البحث', searchTerm ? `نتائج البحث عن: ${searchTerm}` : 'اكتب كلمة في مربع البحث', `${s.length ? `<h2>الأخصائيون</h2><div class="grid">${specialistCards(s)}</div>` : ''}${qs.length ? `<section class="section"><h2>الأسئلة</h2><div class="grid">${questionCards(qs)}</div></section>` : (!s.length ? '<div class="card empty">لا توجد نتائج.</div>' : '')}`);
  }

  const routes = {
    '/': home, '/specialists': specialistsPage, '/questions': questionsPage, '/facilities': facilities,
    '/pharmacy': pharmacy, '/marketplace': marketplace, '/academy': academy, '/community': community,
    '/articles': articles, '/library': library, '/tests': tests, '/dashboard': dashboard,
    '/admin': admin, '/verification': verification, '/signup': () => auth('signup'), '/login': () => auth('login'), '/search': searchPage
  };

  function layout(body) {
    root.innerHTML = `${header()}<main>${body}</main><footer><div><b>سهل وبسيط</b><p>${esc(tr('slogan'))}</p></div><div><b>المنصة</b><p>استشارات · أكاديمية · مجتمع · سوق · صيدليات</p></div><div><b>قانوني</b><p>الخصوصية · الشروط · سياسة المحتوى · الدعم</p></div></footer>`;
  }

  function render() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path] || home;
    layout(route());
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang][1];
  }

  window.addEventListener('hashchange', () => { megaOpen=false; noticeOpen=false; render(); });
  document.addEventListener('click', event => {
    if (!event.target.closest('.mega') && !event.target.closest('.nav button') && megaOpen) { megaOpen=false; render(); }
  });
  render();
})();
