(() => {
  'use strict';

  const root = document.getElementById('app');
  if (!root) return;

  const state = {
    lang: localStorage.getItem('bs2_lang') || 'ar',
    route: location.hash || '#/',
    search: '',
    menuOpen: false,
    chatOpen: false,
    selectedSpecialty: null,
    toast: null
  };

  const specialties = [
    { id:'aba', icon:'🧩', ar:'تحليل السلوك التطبيقي ABA', ru:'Прикладной анализ поведения ABA', descAr:'منهجيات تحليل السلوك والتدخلات التعليمية.', descRu:'Анализ поведения и современные образовательные вмешательства.' },
    { id:'neuro', icon:'🧠', ar:'علم النفس العصبي', ru:'Нейропсихология', descAr:'الوظائف المعرفية والدماغ والتقييم العصبي النفسي.', descRu:'Когнитивные функции, мозг и нейропсихологическая диагностика.' },
    { id:'clinical', icon:'🩺', ar:'علم النفس السريري', ru:'Клиническая психология', descAr:'التقييم النفسي والتدخلات العلاجية.', descRu:'Психологическая диагностика и терапевтические подходы.' },
    { id:'family', icon:'👨‍👩‍👧', ar:'علم نفس الأسرة', ru:'Семейная психология', descAr:'العلاقات الأسرية والإرشاد والتواصل.', descRu:'Семейные отношения, консультирование и коммуникация.' },
    { id:'psychoanalysis', icon:'💭', ar:'التحليل النفسي', ru:'Психоанализ', descAr:'النظريات والتحليل والديناميات النفسية.', descRu:'Теории, анализ и психодинамические подходы.' },
    { id:'gestalt', icon:'🌿', ar:'العلاج الجشتالت', ru:'Гештальт-терапия', descAr:'الوعي والخبرة الحالية والعلاقات.', descRu:'Осознанность, текущий опыт и отношения.' },
    { id:'cbt', icon:'🔄', ar:'العلاج السلوكي المعرفي', ru:'Когнитивно-поведенческая терапия', descAr:'الأفكار والمشاعر والسلوك.', descRu:'Связь мыслей, эмоций и поведения.' },
    { id:'art', icon:'🎨', ar:'العلاج بالفن', ru:'Арт-терапия', descAr:'استخدام الإبداع كوسيلة علاجية.', descRu:'Творчество как инструмент психологической помощи.' },
    { id:'drama', icon:'🎭', ar:'العلاج بالدراما', ru:'Драматерапия', descAr:'التعبير والحركة والتمثيل في العملية العلاجية.', descRu:'Выражение, движение и драматические методы.' },
    { id:'coaching', icon:'🚀', ar:'الكوتشنج', ru:'Коучинг', descAr:'الأهداف والمهارات والتطوير الشخصي.', descRu:'Цели, навыки и личностное развитие.' },
    { id:'autism', icon:'♾️', ar:'منهج شامل للتوحد', ru:'Комплексный подход к аутизму', descAr:'التدخلات والتقييم ودعم الأسرة.', descRu:'Оценка, вмешательства и поддержка семьи.' },
    { id:'pecs', icon:'🗂️', ar:'نظام PECS', ru:'Система PECS', descAr:'التواصل من خلال تبادل الصور.', descRu:'Коммуникация через обмен изображениями.' },
    { id:'sensory', icon:'🖐️', ar:'التكامل الحسي', ru:'Сенсорная интеграция', descAr:'معالجة المعلومات الحسية والمهارات الوظيفية.', descRu:'Сенсорная обработка и функциональные навыки.' },
    { id:'hypnosis', icon:'🌙', ar:'التنويم المغناطيسي', ru:'Гипнотерапия', descAr:'تقنيات الاسترخاء والتركيز ضمن إطار مهني.', descRu:'Методы расслабления и фокусировки в профессиональном контексте.' },
    { id:'body', icon:'🫶', ar:'العلاج الموجه للجسم', ru:'Телесно-ориентированная терапия', descAr:'العلاقة بين الخبرة النفسية والجسد.', descRu:'Взаимосвязь психологического опыта и тела.' },
    { id:'neurotherapy', icon:'⚡', ar:'العلاج النفسي العصبي', ru:'Нейропсихологическая терапия', descAr:'دعم الوظائف المعرفية والانفعالية.', descRu:'Поддержка когнитивных и эмоциональных функций.' },
    { id:'integrative', icon:'🧭', ar:'العلاج التكاملي', ru:'Интегративная психотерапия', descAr:'دمج أكثر من مدرسة علاجية حسب الحالة.', descRu:'Сочетание нескольких терапевтических подходов.' },
    { id:'schema', icon:'🧱', ar:'العلاج بالمخططات', ru:'Схематерапия', descAr:'المخططات المبكرة وأنماط التفكير.', descRu:'Ранние схемы и устойчивые модели мышления.' }
  ];

  const courses = [
    { id:1, icon:'🎓', ar:'مدخل إلى علم النفس السريري', ru:'Введение в клиническую психологию', level:'beginner', durationAr:'8 أسابيع', durationRu:'8 недель', students:284 },
    { id:2, icon:'🧩', ar:'أساسيات ABA وتحليل السلوك', ru:'Основы ABA и анализа поведения', level:'intermediate', durationAr:'16 أسبوعًا', durationRu:'16 недель', students:391 },
    { id:3, icon:'🧠', ar:'النمو والوظائف المعرفية', ru:'Развитие и когнитивные функции', level:'intermediate', durationAr:'12 أسبوعًا', durationRu:'12 недель', students:173 },
    { id:4, icon:'🌿', ar:'العلاج الجشتالتي عمليًا', ru:'Практика гештальт-терапии', level:'advanced', durationAr:'24 أسبوعًا', durationRu:'24 недели', students:122 },
    { id:5, icon:'🔄', ar:'العلاج السلوكي المعرفي CBT', ru:'Когнитивно-поведенческая терапия CBT', level:'intermediate', durationAr:'20 أسبوعًا', durationRu:'20 недель', students:315 },
    { id:6, icon:'♾️', ar:'البرنامج الشامل لدعم التوحد', ru:'Комплексная программа поддержки при аутизме', level:'advanced', durationAr:'سنة', durationRu:'1 год', students:207 }
  ];

  const articles = [
    { icon:'🧠', ar:'كيف نقرأ نتائج التقييم النفسي؟', ru:'Как читать результаты психологической оценки؟', tagAr:'علم النفس', tagRu:'Психология', time:'8 min' },
    { icon:'🧩', ar:'مبادئ بناء خطة ABA', ru:'Принципы построения ABA-программы', tagAr:'ABA', tagRu:'ABA', time:'11 min' },
    { icon:'👨‍👩‍👧', ar:'التدريب الأسري ودعم الطفل', ru:'Обучение родителей и поддержка ребёнка', tagAr:'الأسرة', tagRu:'Семья', time:'7 min' },
    { icon:'🎨', ar:'متى نستخدم العلاج بالفن؟', ru:'Когда применяется арт-терапия?', tagAr:'علاج', tagRu:'Терапия', time:'9 min' }
  ];

  const books = [
    { icon:'📘', ar:'أسس علم النفس الإكلينيكي', ru:'Основы клинической психологии', typeAr:'كتاب إلكتروني', typeRu:'Электронная книга' },
    { icon:'📗', ar:'مدخل عملي لتحليل السلوك', ru:'Практическое введение в анализ поведения', typeAr:'مرجع دراسي', typeRu:'Учебное пособие' },
    { icon:'📕', ar:'العلاج السلوكي المعرفي', ru:'Когнитивно-поведенческая терапия', typeAr:'كتاب إلكتروني', typeRu:'Электронная книга' },
    { icon:'📙', ar:'علم النفس العصبي للمتخصصين', ru:'Нейропсихология для специалистов', typeAr:'مرجع', typeRu:'Справочник' }
  ];

  const rooms = [
    { icon:'🧩', ar:'غرفة ABA', ru:'Комната ABA', users:128 },
    { icon:'🧠', ar:'النيرو بسيكولوجي', ru:'Нейропсихология', users:96 },
    { icon:'🩺', ar:'علم النفس السريري', ru:'Клиническая психология', users:84 },
    { icon:'♾️', ar:'التوحد والتواصل', ru:'Аутизм и коммуникация', users:173 }
  ];

  const dict = {
    ar: {
      brand:'BS2',
      tagline:'منصة التعليم والتطوير المهني في علم النفس والعلاجات',
      home:'الرئيسية',
      specialties:'التخصصات',
      courses:'الكورسات',
      community:'المجتمع',
      library:'المكتبة',
      articles:'المقالات',
      exams:'الاختبارات',
      profile:'ملفي',
      dashboard:'لوحتي',
      admin:'الإدارة',
      search:'ابحث في المنصة...',
      login:'تسجيل الدخول',
      register:'إنشاء حساب',
      explore:'استكشف المنصة',
      learn:'ابدأ التعلم',
      viewAll:'عرض الكل',
      popular:'الأكثر شعبية',
      allSpecialties:'جميع التخصصات',
      allCourses:'جميع الكورسات',
      rooms:'غرف المجتمع',
      books:'المكتبة والكتب',
      ai:'المساعد الذكي',
      studentAI:'مساعد الطالب',
      teacherAI:'مساعد المدرس',
      adminAI:'مساعد الإدارة',
      articlesTitle:'المقالات والمعرفة',
      examsTitle:'اختبارات تدريبية',
      heroTitle:'كل المعرفة المهنية في مكان واحد',
      heroText:'منصة ثنائية اللغة للتعلم، التخصص، تبادل الخبرات وبناء مجتمع مهني للمتخصصين والطلاب.',
      statsStudents:'طالب ومتخصص',
      statsCourses:'كورس تدريبي',
      statsSpecialties:'تخصص',
      statsRooms:'غرفة مجتمع',
      chooseSpecialty:'اختر تخصصك',
      continue:'متابعة التعلم',
      progress:'التقدم',
      communityTitle:'مجتمع BS2',
      communityText:'ناقش الحالات التعليمية، تبادل الخبرات، وشارك الملفات والمعرفة مع المجتمع المهني.',
      chat:'الدردشة',
      fileShare:'الملفات',
      watch:'المشاهدة',
      duration:'المدة',
      students:'طلاب',
      level:'المستوى',
      open:'فتح',
      details:'التفاصيل',
      free:'مجاني',
      aiText:'احصل على مساعدة تعليمية، تلخيص، شرح ومراجعة للمحتوى.',
      send:'إرسال',
      askAI:'اكتب سؤالك...',
      adminPanel:'لوحة إدارة المنصة',
      adminText:'إدارة المستخدمين والكورسات والمحتوى والمجتمع.',
      users:'المستخدمون',
      content:'المحتوى',
      reports:'التقارير',
      settings:'الإعدادات',
      notifications:'الإشعارات',
      save:'حفظ',
      back:'رجوع',
      language:'اللغة',
      arabic:'العربية',
      russian:'Русский',
      noResults:'لا توجد نتائج',
      welcome:'مرحبًا بك في BS2'
    },
    ru: {
      brand:'BS2',
      tagline:'Платформа обучения и профессионального развития в психологии и терапии',
      home:'Главная',
      specialties:'Специализации',
      courses:'Курсы',
      community:'Сообщество',
      library:'Библиотека',
      articles:'Статьи',
      exams:'Тесты',
      profile:'Мой профиль',
      dashboard:'Кабинет',
      admin:'Администрирование',
      search:'Поиск по платформе...',
      login:'Войти',
      register:'Регистрация',
      explore:'Исследовать платформу',
      learn:'Начать обучение',
      viewAll:'Смотреть всё',
      popular:'Популярное',
      allSpecialties:'Все специализации',
      allCourses:'Все курсы',
      rooms:'Комнаты сообщества',
      books:'Библиотека и книги',
      ai:'AI-помощник',
      studentAI:'Помощник студента',
      teacherAI:'Помощник преподавателя',
      adminAI:'Помощник администратора',
      articlesTitle:'Статьи и знания',
      examsTitle:'Практические тесты',
      heroTitle:'Профессиональные знания в одном месте',
      heroText:'Двуязычная платформа для обучения, специализации, обмена опытом и профессионального сообщества.',
      statsStudents:'студентов и специалистов',
      statsCourses:'учебных курсов',
      statsSpecialties:'специализаций',
      statsRooms:'комнат сообщества',
      chooseSpecialty:'Выберите специализацию',
      continue:'Продолжить обучение',
      progress:'Прогресс',
      communityTitle:'Сообщество BS2',
      communityText:'Обсуждайте образовательные кейсы, обменивайтесь опытом, файлами и знаниями.',
      chat:'Чат',
      fileShare:'Файлы',
      watch:'Видео',
      duration:'Длительность',
      students:'студентов',
      level:'Уровень',
      open:'Открыть',
      details:'Подробнее',
      free:'Бесплатно',
      aiText:'Получайте помощь в обучении, объяснениях, конспектах и повторении материала.',
      send:'Отправить',
      askAI:'Напишите вопрос...',
      adminPanel:'Панель управления',
      adminText:'Управление пользователями, курсами, контентом и сообществом.',
      users:'Пользователи',
      content:'Контент',
      reports:'Отчёты',
      settings:'Настройки',
      notifications:'Уведомления',
      save:'Сохранить',
      back:'Назад',
      language:'Язык',
      arabic:'العربية',
      russian:'Русский',
      noResults:'Ничего не найдено',
      welcome:'Добро пожаловать в BS2'
    }
  };

  const t = key => dict[state.lang][key] || key;
  const isAr = () => state.lang === 'ar';
  const tx = (obj, suffix = '') => isAr() ? obj.ar + suffix : obj.ru + suffix;
  const esc = v => String(v ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');

  function injectStyles() {
    if (document.getElementById('bs2-styles')) return;

    const style = document.createElement('style');
    style.id = 'bs2-styles';
    style.textContent = `
      :root{
        --bg:#f5f8fc;
        --card:#ffffff;
        --text:#14213d;
        --muted:#6b7890;
        --primary:#2563eb;
        --primary2:#1d4ed8;
        --green:#0f766e;
        --purple:#7c3aed;
        --line:#e5eaf2;
        --shadow:0 12px 35px rgba(24,39,75,.08);
        --radius:22px;
      }
      *{box-sizing:border-box}
      html{scroll-behavior:smooth}
      body{
        margin:0;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
        background:var(--bg);
        color:var(--text);
      }
      body[dir="rtl"]{font-family:Arial,"Segoe UI",sans-serif}
      a{text-decoration:none;color:inherit}
      button,input,textarea,select{font:inherit}
      button{cursor:pointer}
      .bs2-shell{min-height:100vh}
      .topbar{
        position:sticky;top:0;z-index:100;
        background:rgba(255,255,255,.95);
        backdrop-filter:blur(14px);
        border-bottom:1px solid var(--line)
      }
      .navwrap{
        max-width:1400px;margin:auto;padding:14px 24px;
        display:flex;align-items:center;gap:18px
      }
      .brand{
        display:flex;align-items:center;gap:10px;font-weight:900;
        font-size:24px;color:#0f172a;min-width:125px
      }
      .brandmark{
        width:42px;height:42px;border-radius:14px;
        background:linear-gradient(135deg,#2563eb,#7c3aed);
        color:white;display:grid;place-items:center;font-weight:900
      }
      .nav{
        display:flex;align-items:center;gap:6px;flex:1
      }
      .nav a,.nav button{
        border:0;background:transparent;padding:10px 12px;border-radius:12px;
        color:#475569;font-weight:700
      }
      .nav a:hover,.nav button:hover,.nav a.active{
        background:#eef4ff;color:var(--primary)
      }
      .actions{display:flex;align-items:center;gap:8px}
      .search{
        background:#f1f5f9;border:1px solid transparent;border-radius:14px;
        padding:10px 14px;width:210px;outline:none
      }
      .search:focus{background:white;border-color:#bfdbfe}
      .lang{
        border:1px solid var(--line);background:white;border-radius:12px;
        padding:9px 10px
      }
      .btn{
        border:0;border-radius:13px;padding:11px 16px;font-weight:800
      }
      .btn-primary{background:var(--primary);color:white}
      .btn-primary:hover{background:var(--primary2)}
      .btn-light{background:white;border:1px solid var(--line);color:#334155}
      .btn-dark{background:#0f172a;color:white}
      .container{max-width:1400px;margin:auto;padding:0 24px}
      .hero{
        padding:74px 0 52px;
        background:
          radial-gradient(circle at 10% 20%,rgba(37,99,235,.13),transparent 28%),
          radial-gradient(circle at 90% 20%,rgba(124,58,237,.13),transparent 30%),
          linear-gradient(180deg,#fff,#f8fbff)
      }
      .hero-grid{
        display:grid;grid-template-columns:1.25fr .75fr;gap:34px;align-items:center
      }
      .eyebrow{
        display:inline-flex;padding:8px 12px;border-radius:999px;
        background:#eef4ff;color:var(--primary);font-weight:900;margin-bottom:16px
      }
      .hero h1{font-size:clamp(38px,5vw,68px);line-height:1.05;margin:0 0 20px;letter-spacing:-1.8px}
      .hero p{font-size:19px;line-height:1.9;color:var(--muted);max-width:760px}
      .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
      .hero-card{
        background:white;border:1px solid var(--line);box-shadow:var(--shadow);
        border-radius:28px;padding:22px
      }
      .hero-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
      .hero-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .mini-stat{padding:18px;border-radius:18px;background:#f8fafc;border:1px solid var(--line)}
      .mini-stat strong{display:block;font-size:25px}
      .section{padding:58px 0}
      .section-head{
        display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px
      }
      .section-head h2{margin:0;font-size:32px}
      .section-head p{margin:8px 0 0;color:var(--muted)}
      .grid{display:grid;gap:18px}
      .grid-4{grid-template-columns:repeat(4,1fr)}
      .grid-3{grid-template-columns:repeat(3,1fr)}
      .grid-2{grid-template-columns:repeat(2,1fr)}
      .card{
        background:var(--card);border:1px solid var(--line);
        border-radius:var(--radius);box-shadow:0 5px 20px rgba(15,23,42,.04);
        padding:20px
      }
      .card:hover{transform:translateY(-2px);transition:.18s}
      .spec-icon,.course-icon,.book-icon{
        width:54px;height:54px;border-radius:16px;display:grid;place-items:center;
        background:#eef4ff;font-size:27px;margin-bottom:14px
      }
      .card h3{margin:0 0 9px;font-size:18px}
      .card p{color:var(--muted);line-height:1.75;margin:0}
      .tag{
        display:inline-flex;padding:6px 9px;border-radius:999px;
        background:#f1f5f9;color:#475569;font-size:12px;font-weight:800
      }
      .course-top,.card-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .course-meta{display:flex;gap:10px;flex-wrap:wrap;margin:13px 0}
      .course-actions{display:flex;gap:8px;margin-top:18px}
      .room{
        display:flex;align-items:center;gap:14px
      }
      .room-avatar{
        width:54px;height:54px;border-radius:16px;background:#eef4ff;display:grid;place-items:center;font-size:25px
      }
      .online{color:#16a34a;font-size:12px;font-weight:800}
      .library-card{display:flex;gap:14px}
      .article-card .article-cover{
        height:150px;border-radius:18px;background:linear-gradient(135deg,#dbeafe,#ede9fe);
        display:grid;place-items:center;font-size:56px;margin-bottom:16px
      }
      .stats{
        display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:28px
      }
      .stat-box{background:white;border:1px solid var(--line);padding:20px;border-radius:20px}
      .stat-box strong{font-size:30px;display:block}
      .stat-box span{color:var(--muted)}
      .dashboard{
        display:grid;grid-template-columns:250px 1fr;gap:20px;padding:35px 0
      }
      .side{
        background:white;border:1px solid var(--line);border-radius:22px;padding:14px;
        align-self:start;position:sticky;top:90px
      }
      .side button{
        width:100%;border:0;background:transparent;padding:12px;text-align:start;
        border-radius:12px;color:#475569;font-weight:800;margin-bottom:5px
      }
      .side button:hover,.side button.active{background:#eef4ff;color:var(--primary)}
      .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
      .kpi{padding:20px;background:white;border:1px solid var(--line);border-radius:18px}
      .progress{height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden}
      .progress > span{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#7c3aed)}
      .profile{
        display:grid;grid-template-columns:260px 1fr;gap:20px
      }
      .avatar-big{
        width:112px;height:112px;border-radius:34px;background:linear-gradient(135deg,#2563eb,#7c3aed);
        color:white;display:grid;place-items:center;font-size:40px;font-weight:900
      }
      .ai{
        position:fixed;bottom:24px;right:24px;z-index:120;
      }
      body[dir="rtl"] .ai{right:auto;left:24px}
      .ai-button{
        width:60px;height:60px;border:0;border-radius:50%;
        background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;font-size:26px;
        box-shadow:0 15px 30px rgba(37,99,235,.25)
      }
      .ai-panel{
        display:none;position:absolute;bottom:72px;right:0;width:350px;
        background:white;border:1px solid var(--line);border-radius:22px;
        box-shadow:var(--shadow);overflow:hidden
      }
      body[dir="rtl"] .ai-panel{right:auto;left:0}
      .ai-panel.open{display:block}
      .ai-head{padding:16px;background:#0f172a;color:white}
      .ai-body{padding:14px;max-height:330px;overflow:auto}
      .ai-msg{background:#f1f5f9;border-radius:15px;padding:11px 12px;margin-bottom:9px;line-height:1.6}
      .ai-msg.me{background:#eef4ff}
      .ai-compose{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
      .ai-compose input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:12px;outline:none}
      .page-title{padding:46px 0 24px}
      .page-title h1{margin:0;font-size:38px}
      .page-title p{color:var(--muted);line-height:1.8}
      .detail{
        display:grid;grid-template-columns:1fr 340px;gap:20px;padding-bottom:60px
      }
      .video-box{
        min-height:340px;background:linear-gradient(135deg,#0f172a,#312e81);
        color:white;border-radius:25px;display:grid;place-items:center;font-size:64px
      }
      .lesson{display:flex;justify-content:space-between;gap:15px;padding:14px;border-bottom:1px solid var(--line)}
      .lesson:last-child{border-bottom:0}
      .footer{
        background:#0f172a;color:white;margin-top:40px
      }
      .footer-grid{
        display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:30px;padding:45px 0
      }
      .footer p{color:#94a3b8;line-height:1.8}
      .footer a{display:block;color:#cbd5e1;margin:10px 0}
      .toast{
        position:fixed;top:88px;right:24px;z-index:200;background:#0f172a;color:white;
        padding:13px 16px;border-radius:13px;box-shadow:var(--shadow)
      }
      body[dir="rtl"] .toast{right:auto;left:24px}
      .mobile-menu{display:none}
      .notice{padding:14px 16px;border-radius:15px;background:#eff6ff;color:#1d4ed8;font-weight:700}
      .danger{background:#fef2f2;color:#b91c1c}
      @media(max-width:1100px){
        .nav{display:none}
        .search{width:150px}
        .grid-4{grid-template-columns:repeat(2,1fr)}
        .hero-grid,.detail{grid-template-columns:1fr}
        .stats,.kpis{grid-template-columns:repeat(2,1fr)}
        .dashboard{grid-template-columns:1fr}
        .side{position:static}
        .profile{grid-template-columns:1fr}
        .footer-grid{grid-template-columns:1fr 1fr}
      }
      @media(max-width:700px){
        .container{padding:0 15px}
        .navwrap{padding:10px 15px}
        .brand{min-width:auto}
        .actions .btn-light,.actions .btn-primary{display:none}
        .search{width:120px}
        .hero{padding:45px 0 30px}
        .hero h1{font-size:42px}
        .grid-4,.grid-3,.grid-2,.stats,.kpis{grid-template-columns:1fr}
        .footer-grid{grid-template-columns:1fr}
        .ai-panel{width:300px}
      }
    `;
    document.head.appendChild(style);
  }

  function navigate(hash) {
    if (location.hash === hash) {
      state.route = hash;
      render();
    } else {
      location.hash = hash;
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showToast(message) {
    state.toast = message;
    render();
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      state.toast = null;
      render();
    }, 2500);
  }

  function header() {
    const routes = [
      ['#/', t('home')],
      ['#/specialties', t('specialties')],
      ['#/courses', t('courses')],
      ['#/community', t('community')],
      ['#/library', t('library')],
      ['#/articles', t('articles')],
      ['#/tests', t('exams')]
    ];

    return `
      <header class="topbar">
        <div class="navwrap">
          <a class="brand" href="#/">
            <span class="brandmark">B2</span>
            <span>${t('brand')}</span>
          </a>

          <nav class="nav">
            ${routes.map(([href,label]) => `
              <a href="${href}" class="${state.route.split('?')[0] === href ? 'active':''}">${esc(label)}</a>
            `).join('')}
          </nav>

          <div class="actions">
            <input
              id="globalSearch"
              class="search"
              value="${esc(state.search)}"
              placeholder="${esc(t('search'))}"
              aria-label="${esc(t('search'))}"
            />

            <select id="languageSelect" class="lang" aria-label="${esc(t('language'))}">
              <option value="ar" ${state.lang==='ar'?'selected':''}>العربية</option>
              <option value="ru" ${state.lang==='ru'?'selected':''}>Русский</option>
            </select>

            <a class="btn btn-light" href="#/login">${esc(t('login'))}</a>
            <a class="btn btn-primary" href="#/register">${esc(t('register'))}</a>
          </div>
        </div>
      </header>
    `;
  }

  function footer() {
    return `
      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <div class="brand" style="color:white">
              <span class="brandmark">B2</span>
              <span>BS2</span>
            </div>
            <p>${esc(t('tagline'))}</p>
          </div>
          <div>
            <strong>${esc(t('specialties'))}</strong>
            <a href="#/specialties">${esc(t('allSpecialties'))}</a>
            <a href="#/courses">${esc(t('allCourses'))}</a>
          </div>
          <div>
            <strong>${esc(t('community'))}</strong>
            <a href="#/community">${esc(t('rooms'))}</a>
            <a href="#/articles">${esc(t('articles'))}</a>
          </div>
          <div>
            <strong>${esc(t('library'))}</strong>
            <a href="#/library">${esc(t('books'))}</a>
            <a href="#/tests">${esc(t('exams'))}</a>
          </div>
        </div>
      </footer>
    `;
  }

  function home() {
    return `
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <span class="eyebrow">BS2 • ${isAr() ? 'تعلم • مجتمع • تخصص':'Обучение • Сообщество • Специализация'}</span>
            <h1>${esc(t('heroTitle'))}</h1>
            <p>${esc(t('heroText'))}</p>

            <div class="hero-actions">
              <a class="btn btn-primary" href="#/courses">${esc(t('learn'))}</a>
              <a class="btn btn-light" href="#/specialties">${esc(t('explore'))}</a>
            </div>

            <div class="stats">
              <div class="stat-box"><strong>12K+</strong><span>${esc(t('statsStudents'))}</span></div>
              <div class="stat-box"><strong>120+</strong><span>${esc(t('statsCourses'))}</span></div>
              <div class="stat-box"><strong>18</strong><span>${esc(t('statsSpecialties'))}</span></div>
              <div class="stat-box"><strong>40+</strong><span>${esc(t('statsRooms'))}</span></div>
            </div>
          </div>

          <div class="hero-card">
            <div class="hero-card-head">
              <div>
                <strong>${esc(t('welcome'))}</strong>
                <div style="color:var(--muted);margin-top:5px">${isAr()?'مساحتك التعليمية والمهنية':'Ваше учебное и профессиональное пространство'}</div>
              </div>
              <span class="tag">${isAr()?'نسخة تجريبية':'MVP'}</span>
            </div>
            <div class="hero-card-grid">
              <div class="mini-stat">
                <span>🎓</span>
                <strong>24</strong>
                <small>${esc(t('continue'))}</small>
              </div>
              <div class="mini-stat">
                <span>💬</span>
                <strong>40+</strong>
                <small>${esc(t('rooms'))}</small>
              </div>
              <div class="mini-stat">
                <span>📚</span>
                <strong>500+</strong>
                <small>${esc(t('books'))}</small>
              </div>
              <div class="mini-stat">
                <span>🤖</span>
                <strong>3</strong>
                <small>${esc(t('ai'))}</small>
              </div>
            </div>
            <div class="notice" style="margin-top:14px">
              ${isAr()
                ? 'كل قسم في BS2 يمكن أن يحتوي على كورسات، دروس فيديو، مكتبة، مقالات، اختبارات وغرفة مجتمع.'
                : 'Каждый раздел BS2 может включать курсы, видеоуроки, библиотеку, статьи, тесты и комнату сообщества.'}
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <h2>${esc(t('chooseSpecialty'))}</h2>
              <p>${isAr()?'مسارات دراسية مرنة من أسبوعين حتى سنتين.':'Гибкие учебные траектории от 2 недель до 2 лет.'}</p>
            </div>
            <a class="btn btn-light" href="#/specialties">${esc(t('viewAll'))}</a>
          </div>

          <div class="grid grid-4">
            ${specialties.slice(0,8).map(specialtyCard).join('')}
          </div>
        </div>
      </section>

      <section class="section" style="background:#eef4ff">
        <div class="container">
          <div class="section-head">
            <div>
              <h2>${esc(t('popular'))}</h2>
              <p>${isAr()?'كورسات عملية قابلة للتوسع والتحديث.':'Практические курсы с возможностью обновления программ.'}</p>
            </div>
            <a class="btn btn-light" href="#/courses">${esc(t('viewAll'))}</a>
          </div>

          <div class="grid grid-3">
            ${courses.slice(0,6).map(courseCard).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <h2>${esc(t('communityTitle'))}</h2>
              <p>${esc(t('communityText'))}</p>
            </div>
            <a class="btn btn-light" href="#/community">${esc(t('chat'))}</a>
          </div>

          <div class="grid grid-4">
            ${rooms.map(room => `
              <div class="card room">
                <div class="room-avatar">${room.icon}</div>
                <div style="flex:1">
                  <h3>${esc(tx(room))}</h3>
                  <div class="online">● ${room.users} ${esc(t('students'))}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div>
              <h2>${esc(t('articlesTitle'))}</h2>
              <p>${isAr()?'تعلم مستمر ومحتوى مهني منظم.':'Профессиональные материалы для постоянного обучения.'}</p>
            </div>
            <a class="btn btn-light" href="#/articles">${esc(t('viewAll'))}</a>
          </div>

          <div class="grid grid-4">
            ${articles.map(articleCard).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function specialtyCard(s) {
    return `
      <div class="card">
        <div class="spec-icon">${s.icon}</div>
        <span class="tag">${esc(tx(s))}</span>
        <h3 style="margin-top:12px">${esc(isAr()?s.ar:s.ru)}</h3>
        <p>${esc(isAr()?s.descAr:s.descRu)}</p>
        <div style="margin-top:16px">
          <button class="btn btn-light" data-specialty="${esc(s.id)}">${esc(t('details'))}</button>
        </div>
      </div>
    `;
  }

  function courseCard(c) {
    const level = c.level === 'beginner'
      ? (isAr()?'مبتدئ':'Начальный')
      : c.level === 'intermediate'
        ? (isAr()?'متوسط':'Средний')
        : (isAr()?'متقدم':'Продвинутый');

    return `
      <div class="card">
        <div class="course-top">
          <div class="course-icon">${c.icon}</div>
          <span class="tag">${esc(level)}</span>
        </div>
        <h3>${esc(isAr()?c.ar:c.ru)}</h3>
        <div class="course-meta">
          <span class="tag">⏱ ${esc(isAr()?c.durationAr:c.durationRu)}</span>
          <span class="tag">👥 ${c.students}</span>
        </div>
        <div class="progress"><span style="width:${20 + (c.id*7)%55}%"></span></div>
        <div style="color:var(--muted);font-size:13px;margin-top:7px">${esc(t('progress'))}</div>
        <div class="course-actions">
          <a class="btn btn-primary" href="#/course/${c.id}">${esc(t('open'))}</a>
          <button class="btn btn-light" data-course="${c.id}">${esc(t('details'))}</button>
        </div>
      </div>
    `;
  }

  function articleCard(a) {
    return `
      <div class="card article-card">
        <div class="article-cover">${a.icon}</div>
        <span class="tag">${esc(isAr()?a.tagAr:a.tagRu)}</span>
        <h3 style="margin-top:11px">${esc(isAr()?a.ar:a.ru)}</h3>
        <div style="color:var(--muted);font-size:13px">🕒 ${a.time}</div>
      </div>
    `;
  }

  function specialtiesPage() {
    const query = state.search.trim().toLowerCase();
    const filtered = specialties.filter(s => {
      const text = `${s.ar} ${s.ru} ${s.descAr} ${s.descRu}`.toLowerCase();
      return !query || text.includes(query);
    });

    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('allSpecialties'))}</h1>
          <p>${isAr()?'اختَر مجالًا لتظهر لك الكورسات والمكتبة والمقالات وغرف الدردشة المرتبطة به.':'Выберите направление, чтобы открыть курсы, библиотеку, статьи и чат.'}</p>
        </div>

        <div class="grid grid-3" style="padding-bottom:60px">
          ${filtered.length ? filtered.map(specialtyCard).join('') : `<div class="card"><h3>${esc(t('noResults'))}</h3></div>`}
        </div>
      </div>
    `;
  }

  function coursesPage() {
    const query = state.search.trim().toLowerCase();
    const filtered = courses.filter(c => `${c.ar} ${c.ru}`.toLowerCase().includes(query));

    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('allCourses'))}</h1>
          <p>${isAr()?'من كورسات قصيرة إلى مسارات طويلة تصل إلى سنتين.':'От коротких курсов до программ продолжительностью до двух лет.'}</p>
        </div>

        <div class="grid grid-3" style="padding-bottom:60px">
          ${filtered.map(courseCard).join('')}
        </div>
      </div>
    `;
  }

  function courseDetail(id) {
    const c = courses.find(x => x.id === Number(id)) || courses[0];

    return `
      <div class="container">
        <div class="page-title">
          <a href="#/courses" style="color:var(--primary);font-weight:800">← ${esc(t('back'))}</a>
          <h1 style="margin-top:15px">${esc(isAr()?c.ar:c.ru)}</h1>
          <p>${isAr()
            ? 'برنامج تدريبي مرن يحتوي على دروس فيديو، مواد دراسية، ملفات، اختبار نهائي، غرفة مجتمع ومتابعة للتقدم.'
            : 'Гибкая учебная программа с видеоуроками, материалами, файлами, финальным тестом, комнатой сообщества и отслеживанием прогресса.'}</p>
        </div>

        <div class="detail">
          <div>
            <div class="video-box">▶</div>

            <div class="card" style="margin-top:18px">
              <h2>${isAr()?'محتوى الكورس':'Содержание курса'}</h2>
              ${[
                isAr()?'الوحدة الأولى — الأساسيات':'Модуль 1 — Основы',
                isAr()?'الوحدة الثانية — التقييم':'Модуль 2 — Оценка',
                isAr()?'الوحدة الثالثة — التدخل':'Модуль 3 — Вмешательства',
                isAr()?'الوحدة الرابعة — التطبيق العملي':'Модуль 4 — Практика',
                isAr()?'الاختبار النهائي':'Итоговый тест'
              ].map((x,i)=>`
                <div class="lesson">
                  <span>${i<4?'🎬':'📝'} ${esc(x)}</span>
                  <span class="tag">${i<4?'15 min':'30 min'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <aside>
            <div class="card">
              <div class="course-icon">${c.icon}</div>
              <h3>${esc(isAr()?c.ar:c.ru)}</h3>
              <p>${esc(isAr()?c.durationAr:c.durationRu)} • ${c.students} ${esc(t('students'))}</p>
              <button class="btn btn-primary" style="width:100%;margin-top:16px" id="enrollBtn">
                ${esc(t('learn'))}
              </button>
              <div class="notice" style="margin-top:12px">${esc(t('free'))}</div>
            </div>

            <div class="card" style="margin-top:14px">
              <h3>🤖 ${esc(t('ai'))}</h3>
              <p>${esc(t('aiText'))}</p>
              <button class="btn btn-light" style="width:100%;margin-top:12px" id="openAIFromCourse">
                ${esc(t('studentAI'))}
              </button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function communityPage() {
    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('communityTitle'))}</h1>
          <p>${esc(t('communityText'))}</p>
        </div>

        <div class="grid grid-2" style="padding-bottom:60px">
          ${rooms.map((r,i)=>`
            <div class="card">
              <div class="room">
                <div class="room-avatar">${r.icon}</div>
                <div style="flex:1">
                  <h3>${esc(tx(r))}</h3>
                  <div class="online">● ${r.users} ${esc(t('students'))}</div>
                </div>
                <button class="btn btn-primary" data-room="${i}">${esc(t('chat'))}</button>
              </div>
              <div class="notice" style="margin-top:15px">
                ${isAr()
                  ? 'يمكن للأعضاء تبادل الرسائل والملفات والخبرات والمواد التعليمية.'
                  : 'Участники могут обмениваться сообщениями, файлами, опытом и учебными материалами.'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function libraryPage() {
    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('books'))}</h1>
          <p>${isAr()?'مكتبة منظمة حسب التخصص مع كتب ومراجع وملفات تعليمية.':'Библиотека по специализациям с книгами, справочниками и учебными файлами.'}</p>
        </div>

        <div class="grid grid-2" style="padding-bottom:60px">
          ${books.map(b=>`
            <div class="card library-card">
              <div class="book-icon">${b.icon}</div>
              <div style="flex:1">
                <span class="tag">${esc(isAr()?b.typeAr:b.typeRu)}</span>
                <h3 style="margin-top:10px">${esc(isAr()?b.ar:b.ru)}</h3>
                <p>${isAr()?'ملف تعليمي قابل للقراءة داخل المنصة.':'Учебный материал, доступный внутри платформы.'}</p>
                <button class="btn btn-light" style="margin-top:12px" data-book="${esc(isAr()?b.ar:b.ru)}">${esc(t('open'))}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function articlesPage() {
    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('articlesTitle'))}</h1>
          <p>${isAr()?'مقالات متخصصة، أدلة قصيرة ومواد معرفية للطلاب والمتخصصين.':'Специализированные статьи, краткие руководства и материалы для студентов и специалистов.'}</p>
        </div>

        <div class="grid grid-3" style="padding-bottom:60px">
          ${articles.concat(articles).map(articleCard).join('')}
        </div>
      </div>
    `;
  }

  function testsPage() {
    const tests = [
      isAr()?'اختبار أساسيات ABA':'Тест по основам ABA',
      isAr()?'اختبار مبادئ علم النفس السريري':'Тест по клинической психологии',
      isAr()?'اختبار الوظائف المعرفية':'Тест по когнитивным функциям',
      isAr()?'اختبار العلاج السلوكي المعرفي':'Тест по когнитивно-поведенческой терапии'
    ];

    return `
      <div class="container">
        <div class="page-title">
          <h1>${esc(t('examsTitle'))}</h1>
          <p>${isAr()?'اختبارات تدريبية مع نتيجة فورية وسجل للتقدم.':'Практические тесты с мгновенным результатом и историей прогресса.'}</p>
        </div>

        <div class="grid grid-2" style="padding-bottom:60px">
          ${tests.map((x,i)=>`
            <div class="card">
              <div class="card-row">
                <div>
                  <span class="tag">TEST ${i+1}</span>
                  <h3 style="margin-top:12px">${esc(x)}</h3>
                  <p>${isAr()?'20 سؤالًا • 15 دقيقة':'20 вопросов • 15 минут'}</p>
                </div>
                <div style="font-size:35px">📝</div>
              </div>
              <button class="btn btn-primary" style="margin-top:16px" data-test="${i}">${esc(t('open'))}</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function profilePage() {
    return `
      <div class="container" style="padding-top:35px;padding-bottom:60px">
        <div class="profile">
          <div class="card">
            <div class="avatar-big">G</div>
            <h2 style="margin:18px 0 5px">${isAr()?'الطالب الجديد':'Новый студент'}</h2>
            <p>${isAr()?'طالب في BS2':'Студент BS2'}</p>
            <button class="btn btn-primary" style="width:100%;margin-top:12px">${esc(t('save'))}</button>
          </div>

          <div class="card">
            <h2>${esc(t('profile'))}</h2>
            <div class="grid grid-2" style="margin-top:15px">
              <div>
                <span class="tag">${isAr()?'التخصص المفضل':'Любимая специализация'}</span>
                <h3>${isAr()?'علم النفس السريري':'Клиническая психология'}</h3>
              </div>
              <div>
                <span class="tag">${esc(t('progress'))}</span>
                <h3>38%</h3>
              </div>
            </div>
            <div style="margin-top:25px">
              <div class="card-row">
                <strong>${esc(t('continue'))}</strong>
                <span>38%</span>
              </div>
              <div class="progress" style="margin-top:8px"><span style="width:38%"></span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function dashboardPage() {
    return `
      <div class="container">
        <div class="dashboard">
          <aside class="side">
            <button class="active">📊 ${esc(t('dashboard'))}</button>
            <button>🎓 ${esc(t('courses'))}</button>
            <button>📚 ${esc(t('library'))}</button>
            <button>💬 ${esc(t('community'))}</button>
            <button>🔔 ${esc(t('notifications'))}</button>
            <button>⚙️ ${esc(t('settings'))}</button>
          </aside>

          <main>
            <div class="page-title" style="padding-top:0">
              <h1>${esc(t('dashboard'))}</h1>
              <p>${isAr()?'تابع كورساتك، الاختبارات، الملفات والتقدم.':'Отслеживайте курсы, тесты, файлы и прогресс.'}</p>
            </div>

            <div class="kpis">
              <div class="kpi"><span>🎓</span><strong>4</strong><div>${esc(t('courses'))}</div></div>
              <div class="kpi"><span>✅</span><strong>17</strong><div>${esc(t('exams'))}</div></div>
              <div class="kpi"><span>📚</span><strong>26</strong><div>${esc(t('books'))}</div></div>
              <div class="kpi"><span>💬</span><strong>9</strong><div>${esc(t('community'))}</div></div>
            </div>

            <div class="card" style="margin-top:18px">
              <div class="section-head">
                <div>
                  <h2>${esc(t('continue'))}</h2>
                  <p>${isAr()?'أكمل من حيث توقفت.':'Продолжите с места остановки.'}</p>
                </div>
                <a class="btn btn-primary" href="#/courses">${esc(t('viewAll'))}</a>
              </div>

              <div class="grid grid-2">
                ${courses.slice(0,2).map(c=>`
                  <div class="card">
                    <div class="card-row">
                      <div>
                        <h3>${esc(isAr()?c.ar:c.ru)}</h3>
                        <p>${esc(isAr()?c.durationAr:c.durationRu)}</p>
                      </div>
                      <span class="tag">${35 + c.id*5}%</span>
                    </div>
                    <div class="progress" style="margin-top:12px"><span style="width:${35+c.id*5}%"></span></div>
                  </div>
                `).join('')}
              </div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  function adminPage() {
    return `
      <div class="container" style="padding-bottom:60px">
        <div class="page-title">
          <h1>${esc(t('adminPanel'))}</h1>
          <p>${esc(t('adminText'))}</p>
        </div>

        <div class="kpis">
          <div class="kpi"><span>👥</span><strong>12,480</strong><div>${esc(t('users'))}</div></div>
          <div class="kpi"><span>📚</span><strong>126</strong><div>${esc(t('content'))}</div></div>
          <div class="kpi"><span>📈</span><strong>4,921</strong><div>${esc(t('reports'))}</div></div>
          <div class="kpi"><span>🔔</span><strong>18</strong><div>${esc(t('notifications'))}</div></div>
        </div>

        <div class="grid grid-3" style="margin-top:20px">
          <div class="card">
            <h3>👥 ${esc(t('users'))}</h3>
            <p>${isAr()?'إدارة الطلاب والمتخصصين والمدرسين والصلاحيات.':'Управление студентами, специалистами, преподавателями и правами.'}</p>
            <button class="btn btn-light" style="margin-top:12px">${esc(t('open'))}</button>
          </div>
          <div class="card">
            <h3>📚 ${esc(t('content'))}</h3>
            <p>${isAr()?'إدارة الكورسات والدروس والمكتبة والمقالات والاختبارات.':'Управление курсами, уроками, библиотекой, статьями и тестами.'}</p>
            <button class="btn btn-light" style="margin-top:12px">${esc(t('open'))}</button>
          </div>
          <div class="card">
            <h3>🤖 ${esc(t('adminAI'))}</h3>
            <p>${esc(t('aiText'))}</p>
            <button class="btn btn-light" style="margin-top:12px" id="openAdminAI">${esc(t('open'))}</button>
          </div>
        </div>
      </div>
    `;
  }

  function loginPage(register=false) {
    return `
      <div class="container" style="padding:60px 0">
        <div class="card" style="max-width:500px;margin:auto">
          <div style="text-align:center;margin-bottom:25px">
            <div class="brand" style="justify-content:center">
              <span class="brandmark">B2</span>
              <span>BS2</span>
            </div>
            <h1 style="margin:20px 0 8px">${esc(register?t('register'):t('login'))}</h1>
            <p>${isAr()?'أنشئ حسابًا للوصول إلى الكورسات والمجتمع والملفات.':'Создайте аккаунт для доступа к курсам, сообществу и файлам.'}</p>
          </div>

          ${register ? `
            <label style="display:block;margin:10px 0 6px">${isAr()?'الاسم':'Имя'}</label>
            <input id="regName" style="width:100%;padding:12px;border:1px solid var(--line);border-radius:12px" placeholder="${isAr()?'الاسم الكامل':'Полное имя'}">
          `:''}

          <label style="display:block;margin:10px 0 6px">${isAr()?'البريد الإلكتروني':'E-mail'}</label>
          <input id="authEmail" type="email" style="width:100%;padding:12px;border:1px solid var(--line);border-radius:12px" placeholder="email@example.com">

          <label style="display:block;margin:10px 0 6px">${isAr()?'كلمة المرور':'Пароль'}</label>
          <input id="authPassword" type="password" style="width:100%;padding:12px;border:1px solid var(--line);border-radius:12px" placeholder="••••••••">

          <button class="btn btn-primary" style="width:100%;margin-top:18px" id="authButton">
            ${esc(register?t('register'):t('login'))}
          </button>

          <button class="btn btn-light" style="width:100%;margin-top:10px" id="guestButton">
            ${isAr()?'الدخول كتجربة':'Войти в демо-режиме'}
          </button>
        </div>
      </div>
    `;
  }

  function aiWidget() {
    return `
      <div class="ai">
        <div class="ai-panel ${state.chatOpen?'open':''}" id="aiPanel">
          <div class="ai-head">
            <strong>🤖 ${esc(t('studentAI'))}</strong>
            <div style="opacity:.8;font-size:12px;margin-top:4px">${esc(t('aiText'))}</div>
          </div>
          <div class="ai-body" id="aiBody">
            <div class="ai-msg">
              ${isAr()
                ? 'مرحبًا! أستطيع مساعدتك في فهم الدروس، تلخيص المواد، إنشاء أسئلة تدريبية وتنظيم خطة الدراسة.'
                : 'Здравствуйте! Я могу объяснить уроки, сделать конспект, создать тренировочные вопросы и помочь организовать обучение.'}
            </div>
          </div>
          <div class="ai-compose">
            <input id="aiInput" placeholder="${esc(t('askAI'))}">
            <button class="btn btn-primary" id="aiSend">${esc(t('send'))}</button>
          </div>
        </div>
        <button class="ai-button" id="aiToggle">🤖</button>
      </div>
    `;
  }

  function renderPage() {
    const path = state.route.split('?')[0];

    if (path === '#/') return home();
    if (path === '#/specialties') return specialtiesPage();
    if (path === '#/courses') return coursesPage();
    if (path.startsWith('#/course/')) return courseDetail(path.split('/')[2]);
    if (path === '#/community') return communityPage();
    if (path === '#/library') return libraryPage();
    if (path === '#/articles') return articlesPage();
    if (path === '#/tests') return testsPage();
    if (path === '#/profile') return profilePage();
    if (path === '#/dashboard') return dashboardPage();
    if (path === '#/admin') return adminPage();
    if (path === '#/login') return loginPage(false);
    if (path === '#/register') return loginPage(true);

    return home();
  }

  function bindEvents() {
    const lang = document.getElementById('languageSelect');
    if (lang) {
      lang.addEventListener('change', e => {
        state.lang = e.target.value;
        localStorage.setItem('bs2_lang', state.lang);
        document.documentElement.lang = state.lang;
        document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
        render();
      });
    }

    const search = document.getElementById('globalSearch');
    if (search) {
      search.addEventListener('input', e => {
        state.search = e.target.value;
        if (state.route !== '#/specialties' && state.route !== '#/courses') return;
        render();
      });
    }

    document.querySelectorAll('[data-specialty]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = specialties.find(x => x.id === btn.dataset.specialty);
        if (!s) return;
        showToast(isAr()
          ? `تم اختيار تخصص: ${s.ar}`
          : `Выбрана специализация: ${s.ru}`);
      });
    });

    document.querySelectorAll('[data-course]').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(isAr() ? 'تمت إضافة الكورس إلى قائمة التعلم.' : 'Курс добавлен в список обучения.');
      });
    });

    document.querySelectorAll('[data-room]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.chatOpen = true;
        render();
        setTimeout(() => {
          const input = document.getElementById('aiInput');
          if (input) input.focus();
        }, 100);
      });
    });

    document.querySelectorAll('[data-test]').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(isAr() ? 'تم فتح الاختبار التجريبي.' : 'Практический тест открыт.');
      });
    });

    document.querySelectorAll('[data-book]').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast(isAr() ? `فتح: ${btn.dataset.book}` : `Открыто: ${btn.dataset.book}`);
      });
    });

    const enroll = document.getElementById('enrollBtn');
    if (enroll) {
      enroll.addEventListener('click', () => {
        showToast(isAr() ? 'تم التسجيل في الكورس التجريبي.' : 'Вы зарегистрированы на демонстрационный курс.');
      });
    }

    const authButton = document.getElementById('authButton');
    if (authButton) {
      authButton.addEventListener('click', () => {
        localStorage.setItem('bs2_demo_user','1');
        showToast(isAr() ? 'تم إنشاء جلسة تجريبية.' : 'Демонстрационная сессия создана.');
        setTimeout(() => navigate('#/dashboard'), 400);
      });
    }

    const guest = document.getElementById('guestButton');
    if (guest) {
      guest.addEventListener('click', () => navigate('#/dashboard'));
    }

    const aiToggle = document.getElementById('aiToggle');
    if (aiToggle) {
      aiToggle.addEventListener('click', () => {
        state.chatOpen = !state.chatOpen;
        render();
      });
    }

    const aiSend = document.getElementById('aiSend');
    if (aiSend) {
      aiSend.addEventListener('click', sendAIMessage);
    }

    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
      aiInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendAIMessage();
      });
    }

    const openAI = document.getElementById('openAIFromCourse');
    if (openAI) {
      openAI.addEventListener('click', () => {
        state.chatOpen = true;
        render();
      });
    }

    const openAdminAI = document.getElementById('openAdminAI');
    if (openAdminAI) {
      openAdminAI.addEventListener('click', () => {
        state.chatOpen = true;
        render();
      });
    }
  }

  function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const body = document.getElementById('aiBody');
    if (!input || !body || !input.value.trim()) return;

    const question = input.value.trim();

    body.innerHTML += `
      <div class="ai-msg me">${esc(question)}</div>
      <div class="ai-msg">
        ${isAr()
          ? 'هذه نسخة أولية من المساعد الذكي. سيتم ربطها بمحرك AI وقاعدة المعرفة الخاصة بالمنصة لاحقًا. حاليًا أستطيع مساعدتك في التنقل بين الأقسام.'
          : 'Это начальная версия AI-помощника. Позже она будет подключена к AI-движку и базе знаний платформы. Сейчас я могу помочь с навигацией по разделам.'}
      </div>
    `;

    input.value = '';
    body.scrollTop = body.scrollHeight;
  }

  function render() {
    injectStyles();

    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

    root.innerHTML = `
      <div class="bs2-shell">
        ${header()}
        <main>${renderPage()}</main>
        ${footer()}
        ${aiWidget()}
        ${state.toast ? `<div class="toast">${esc(state.toast)}</div>` : ''}
      </div>
    `;

    bindEvents();
  }

  window.addEventListener('hashchange', () => {
    state.route = location.hash || '#/';
    render();
  });

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#/"]');
    if (!link) return;
    state.route = link.getAttribute('href');
  });

  render();
})();
