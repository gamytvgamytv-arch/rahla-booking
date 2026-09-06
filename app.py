import os
import smtplib
import sqlite3
import urllib.parse
import urllib.request
from functools import wraps
from email.message import EmailMessage

from flask import Flask, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "development-only-change-me")
app.config["DATABASE"] = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "medical.db"))

SUPPORTED_LANGUAGES = {
    "ar": ("العربية", "rtl"), "en": ("English", "ltr"), "ru": ("Русский", "ltr"),
    "uz": ("O'zbekcha", "ltr"), "uk": ("Українська", "ltr"), "hy": ("Հայերեն", "ltr"),
    "ka": ("ქართული", "ltr"), "de": ("Deutsch", "ltr"),
}
DOCUMENT_TRANSLATIONS = {
    "ar": {"forms": "الاستمارات", "contracts": "العقود", "sign": "أوافق وأوقّع", "signature": "الاسم كما سيظهر في التوقيع", "save": "حفظ", "notice": "هذه مسودة تحتاج مراجعة قانونية محلية."},
    "en": {"forms": "Forms", "contracts": "Contracts", "sign": "I agree and sign", "signature": "Name for signature", "save": "Save", "notice": "This draft requires local legal review."},
    "ru": {"forms": "Формы", "contracts": "Договоры", "sign": "Согласен и подписываю", "signature": "Имя для подписи", "save": "Сохранить", "notice": "Этот проект требует местной юридической проверки."},
    "uz": {"forms": "Shakllar", "contracts": "Shartnomalar", "sign": "Roziman va imzolayman", "signature": "Imzo uchun ism", "save": "Saqlash", "notice": "Ushbu loyiha mahalliy yuridik tekshiruvni talab qiladi."},
    "uk": {"forms": "Форми", "contracts": "Договори", "sign": "Погоджуюсь і підписую", "signature": "Ім'я для підпису", "save": "Зберегти", "notice": "Цей проєкт потребує місцевої юридичної перевірки."},
    "hy": {"forms": "Ձևեր", "contracts": "Պայմանագրեր", "sign": "Համաձայն եմ և ստորագրում եմ", "signature": "Անուն ստորագրության համար", "save": "Պահպանել", "notice": "Այս նախագիծը պահանջում է տեղական իրավական ստուգում:"},
    "ka": {"forms": "ფორმები", "contracts": "ხელშეკრულებები", "sign": "ვეთანხმები და ხელს ვაწერ", "signature": "სახელი ხელმოწერისთვის", "save": "შენახვა", "notice": "ეს პროექტი საჭიროებს ადგილობრივ იურიდიულ შემოწმებას."},
    "de": {"forms": "Formulare", "contracts": "Verträge", "sign": "Ich stimme zu und unterschreibe", "signature": "Name für die Unterschrift", "save": "Speichern", "notice": "Dieser Entwurf benötigt eine lokale rechtliche Prüfung."},
}
LOCALIZED_SITE_NAMES = {
    "ar": "سهلة وبسيطة", "en": "Easy and simple", "ru": "Просто и легко",
    "uz": "Oson va sodda", "uk": "Легко і просто", "hy": "Հեշտ և պարզ",
    "ka": "მარტივი და ადვილი", "de": "Einfach & Klar",
}


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_error=None):
    db = g.pop("db", None)
    if db:
        db.close()


def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'عميل', country TEXT DEFAULT '', phone TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS providers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, specialty TEXT NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL, offer TEXT NOT NULL, price INTEGER NOT NULL, rating REAL NOT NULL, image TEXT NOT NULL, owner_user_id INTEGER, country TEXT DEFAULT '', language TEXT DEFAULT 'العربية', is_demo INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS consultations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, provider_id INTEGER NOT NULL, appointment_date TEXT NOT NULL, service_type TEXT NOT NULL, notes TEXT, status TEXT DEFAULT 'بانتظار التأكيد', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, subject TEXT NOT NULL, question TEXT NOT NULL, specialty TEXT DEFAULT 'عام', question_type TEXT DEFAULT 'مجاني', language TEXT DEFAULT 'العربية', country TEXT DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0, status TEXT DEFAULT 'قيد المراجعة', answer TEXT, expires_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS question_answers (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER NOT NULL, author_id INTEGER NOT NULL, body TEXT NOT NULL, selected INTEGER NOT NULL DEFAULT 0, rating REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS answer_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, answer_id INTEGER NOT NULL, author_id INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS answer_reactions (id INTEGER PRIMARY KEY AUTOINCREMENT, answer_id INTEGER NOT NULL, user_id INTEGER NOT NULL, reaction TEXT NOT NULL, UNIQUE(answer_id, user_id));
        CREATE TABLE IF NOT EXISTS tips (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER NOT NULL, answer_id INTEGER NOT NULL, payer_id INTEGER NOT NULL, recipient_id INTEGER NOT NULL, gross_amount REAL NOT NULL, platform_amount REAL NOT NULL, recipient_amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'تجريبي', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, consultation_id INTEGER NOT NULL, user_id INTEGER NOT NULL, body TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER, title TEXT NOT NULL, content_type TEXT NOT NULL, specialty TEXT DEFAULT 'عام', language TEXT DEFAULT 'العربية', country TEXT DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0, ai_generated INTEGER NOT NULL DEFAULT 0, ai_label_visible INTEGER NOT NULL DEFAULT 1, views INTEGER NOT NULL DEFAULT 0, real_likes INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'قيد المراجعة', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS content_events (id INTEGER PRIMARY KEY AUTOINCREMENT, content_id INTEGER NOT NULL, user_id INTEGER, event_type TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'حقيقي', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS promotion_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id INTEGER NOT NULL, target_type TEXT NOT NULL, target_id INTEGER NOT NULL, budget INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'مدفوع', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS points_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, amount INTEGER NOT NULL, reason TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'تفاعل حقيقي', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS moderation_events (id INTEGER PRIMARY KEY AUTOINCREMENT, content_id INTEGER, user_id INTEGER, agent_name TEXT NOT NULL, risk_level TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'بانتظار المراجعة', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS platform_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS form_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, form_key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, fields_json TEXT NOT NULL, terms TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS contract_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, contract_key TEXT UNIQUE NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, enabled INTEGER NOT NULL DEFAULT 1, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS contract_signatures (id INTEGER PRIMARY KEY AUTOINCREMENT, contract_id INTEGER NOT NULL, user_id INTEGER NOT NULL, signature_name TEXT NOT NULL, consented_at TEXT DEFAULT CURRENT_TIMESTAMP, ip_address TEXT, FOREIGN KEY(contract_id) REFERENCES contract_templates(id), FOREIGN KEY(user_id) REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS moderation_agents (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, specialty TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS complaints (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, category TEXT NOT NULL, ai_draft TEXT, status TEXT NOT NULL DEFAULT 'جديدة', assigned_to TEXT, resolution TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS notification_preferences (user_id INTEGER PRIMARY KEY, email_enabled INTEGER NOT NULL DEFAULT 1, telegram_enabled INTEGER NOT NULL DEFAULT 0, whatsapp_enabled INTEGER NOT NULL DEFAULT 0, telegram_chat_id TEXT, whatsapp_number TEXT);
        CREATE TABLE IF NOT EXISTS notification_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, channel TEXT NOT NULL, event_type TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS admin_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, admin_email TEXT NOT NULL, command TEXT NOT NULL, action TEXT NOT NULL, result TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS activity_events (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, session_key TEXT NOT NULL, event_type TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    """)
    user_columns = {row[1] for row in db.execute("PRAGMA table_info(users)").fetchall()}
    for column, definition in (("role", "TEXT NOT NULL DEFAULT 'عميل'"), ("country", "TEXT DEFAULT ''"), ("phone", "TEXT DEFAULT ''"), ("created_at", "TEXT DEFAULT ''")):
        if column not in user_columns:
            db.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")
    question_columns = {row[1] for row in db.execute("PRAGMA table_info(questions)").fetchall()}
    for column, definition in (("specialty", "TEXT DEFAULT 'عام'"), ("question_type", "TEXT DEFAULT 'مجاني'"), ("language", "TEXT DEFAULT 'العربية'"), ("country", "TEXT DEFAULT ''"), ("is_demo", "INTEGER NOT NULL DEFAULT 0"), ("expires_at", "TEXT")):
        if column not in question_columns:
            db.execute(f"ALTER TABLE questions ADD COLUMN {column} {definition}")
    content_columns = {row[1] for row in db.execute("PRAGMA table_info(content)").fetchall()}
    for column, definition in (("specialty", "TEXT DEFAULT 'عام'"), ("language", "TEXT DEFAULT 'العربية'"), ("country", "TEXT DEFAULT ''"), ("is_demo", "INTEGER NOT NULL DEFAULT 0")):
        if column not in content_columns:
            db.execute(f"ALTER TABLE content ADD COLUMN {column} {definition}")
    if db.execute("SELECT COUNT(*) FROM providers").fetchone()[0] == 0:
        db.executemany("INSERT INTO providers (name, specialty, location, description, offer, price, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
            ("مركز نبض التخصصي", "قلب وأوعية دموية", "الرياض، السعودية", "فريق استشاري متخصص يقدم تقييمًا دقيقًا وخطة علاج واضحة.", "استشارة أولى + تخطيط قلب", 180, 4.9, "pulse"),
            ("عيادات توازن", "صحة نفسية", "دبي، الإمارات", "جلسات آمنة وسرية مع أطباء ومعالجين مرخصين لجميع الأعمار.", "جلسة تقييم نفسي 50 دقيقة", 220, 4.8, "balance"),
            ("مخبر الحياة", "تحاليل وتشخيص", "عمّان، الأردن", "نتائج مخبرية موثوقة مع خدمة سحب عينات منزلية في مناطق مختارة.", "باقة الفحص الشامل", 95, 4.7, "life"),
        ])
    db.execute("INSERT OR IGNORE INTO platform_settings (key, value) VALUES ('allow_ai_content', '1')")
    default_settings = {
        "site_name": "سهلة وبسيطة", "site_tagline": "منصة الاستشارات الطبية", "contact_email": "", "contact_phone": "", "primary_color": "#d86f46", "accent_color": "#3f6e5c", "ad_slots": "الرئيسية، المقالات، المؤسسات", "promotion_packages": "إبراز المؤسسة، ترويج المقال، ترويج الفيديو",
    }
    for key, value in default_settings.items():
        db.execute("INSERT OR IGNORE INTO platform_settings (key, value) VALUES (?, ?)", (key, value))
    form_defaults = [("provider_signup", "استمارة تسجيل مقدم الخدمة", "الاسم، البريد، البلد، التخصص، الترخيص، الوثائق", "أقر بصحة البيانات والوثائق وأتحمل مسؤولية تقديم الخدمة والالتزامات النظامية.") , ("institution_signup", "استمارة تسجيل المؤسسة", "اسم المؤسسة، نوع الخدمة، العنوان، الترخيص، المسؤول القانوني", "أقر بصحة بيانات المؤسسة والوثائق وألتزم بالقواعد المنشورة.")]
    for form_key, title, fields, terms in form_defaults:
        db.execute("INSERT OR IGNORE INTO form_templates (form_key, title, fields_json, terms) VALUES (?, ?, ?, ?)", (form_key, title, fields, terms))
    contract_defaults = [("provider_platform", "اتفاق مقدم الخدمة والمنصة", "مسودة اتفاق: يقر مقدم الخدمة بصحة الوثائق، وبمسؤوليته عن جودة الخدمة والالتزامات النظامية والضريبية والشكاوى المتعلقة بأدائه. لا يعفي هذا النص أي طرف من المسؤوليات التي يفرضها القانون المحلي، ويجب مراجعته من محامٍ قبل الاستخدام."), ("client_platform", "اتفاق العميل والمنصة", "مسودة اتفاق: يوافق العميل على سياسة الاستخدام والخصوصية والدفع، ويدرك أن المنصة وسيط تقني ولا تغني المعلومات عن الطبيب. تخضع المسؤوليات للقانون المحلي."), ("delivery_platform", "اتفاق عامل التوصيل والمنصة", "مسودة اتفاق: يلتزم عامل التوصيل بالسلامة والسرية والمواعيد والأنظمة المحلية. يجب مراجعة النص قانونيًا قبل اعتماده."), ("institution_platform", "اتفاق المؤسسة والمنصة", "مسودة اتفاق: تلتزم المؤسسة بصحة وثائقها وجودة خدماتها واستقبال الشكاوى والالتزامات النظامية، مع عدم إسقاط أي مسؤولية إلزامية على المنصة أو المؤسسة."),]
    for contract_key, title, body in contract_defaults:
        db.execute("INSERT OR IGNORE INTO contract_templates (contract_key, title, body) VALUES (?, ?, ?)", (contract_key, title, body))
    provider_columns = {row[1] for row in db.execute("PRAGMA table_info(providers)").fetchall()}
    for column, definition in (("owner_user_id", "INTEGER"), ("country", "TEXT DEFAULT ''"), ("language", "TEXT DEFAULT 'العربية'"), ("is_demo", "INTEGER NOT NULL DEFAULT 0"), ("demo_views", "INTEGER NOT NULL DEFAULT 0"), ("demo_likes", "INTEGER NOT NULL DEFAULT 0"), ("demo_reviews", "INTEGER NOT NULL DEFAULT 0")):
        if column not in provider_columns:
            db.execute(f"ALTER TABLE providers ADD COLUMN {column} {definition}")
    demo_target = int(os.environ.get("DEMO_PROVIDER_COUNT", "12000"))
    provider_count = db.execute("SELECT COUNT(*) FROM providers").fetchone()[0]
    if provider_count < demo_target:
        demo_catalog = [
            ("مصر", "العربية", "القاهرة"), ("السعودية", "العربية", "الرياض"),
            ("الإمارات", "العربية", "دبي"), ("الأردن", "العربية", "عمّان"),
            ("سوريا", "العربية", "دمشق"), ("اليمن", "العربية", "صنعاء"),
            ("تونس", "العربية", "تونس"), ("روسيا", "الروسية", "موسكو"),
            ("أوزبكستان", "الأوزبكية", "طشقند"), ("أوكرانيا", "الأوكرانية", "كييف"),
            ("أرمينيا", "الأرمنية", "يريفان"), ("جورجيا", "الجورجية", "تبليسي"),
            ("ألمانيا", "الألمانية", "برلين"), ("الولايات المتحدة", "الإنجليزية", "نيويورك"),
        ]
        specialties = ["صحة نفسية", "قلب وأوعية دموية", "أطفال", "مناعة", "تحاليل وتشخيص", "تأهيل وعلاج طبيعي", "جلدية", "صحة المرأة", "صحة المسنين"]
        demo_rows = []
        for index in range(provider_count, demo_target):
            country, language, city = demo_catalog[index % len(demo_catalog)]
            specialty = specialties[index % len(specialties)]
            demo_rows.append((f"ملف تجريبي {index + 1:05d}", specialty, f"{city}، {country}", "هذا ملف تجريبي مولّد لعرض شكل المنصة، وليس أخصائيًا أو مؤسسة حقيقية.", "عرض تجريبي - لا يمكن الحجز", 0, 0, "demo", None, country, language, 1))
        db.executemany("INSERT INTO providers (name, specialty, location, description, offer, price, rating, image, owner_user_id, country, language, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", demo_rows)
    db.execute("UPDATE providers SET demo_views = ((id * 37) % 9000) + 1000, demo_likes = ((id * 11) % 1400) + 120, demo_reviews = ((id * 5) % 180) + 10 WHERE is_demo = 1 AND demo_views = 0")
    seed_localized_demo_content(db)
    if db.execute("SELECT COUNT(*) FROM moderation_agents").fetchone()[0] == 0:
        db.executemany(
            "INSERT INTO moderation_agents (name, specialty) VALUES (?, ?)",
            [(f"مساعد إشراف آلي {number:02d}", specialty) for number, specialty in enumerate([
                "السلامة الطبية", "الخصوصية", "المعلومات المضللة", "اللغة", "الإعلانات", "الصور", "الفيديو", "الصوت", "التنمر", "الاحتيال", "الحقوق", "المحتوى الحساس", "الأسئلة الطبية", "المؤسسات", "المختصون", "الأسعار", "المدفوعات", "المراجعات", "التعليقات", "الرسائل", "المحتوى الاصطناعي", "الترجمة", "الأطفال", "الصحة النفسية", "الطوارئ", "الأدوية", "التحاليل", "الإشاعات", "الدورات", "التدقيق"], 1)],
        )
    db.commit()


def seed_localized_demo_content(db):
    catalog = [
        ("العربية", "مصر", "مساعد افتراضي عربي"), ("الروسية", "روسيا", "Виртуальный помощник"),
        ("الإنجليزية", "الولايات المتحدة", "Virtual assistant"), ("الأوزبكية", "أوزبكستان", "Virtual yordamchi"),
        ("الأوكرانية", "أوكرانيا", "Віртуальний помічник"), ("الأرمنية", "أرمينيا", "Վիրտուալ օգնական"),
        ("الجورجية", "جورجيا", "ვირტუალური ასისტენტი"), ("الألمانية", "ألمانيا", "Virtueller Assistent"),
    ]
    specialties = ["صحة نفسية", "قلب وأوعية دموية", "أطفال", "مناعة", "تحاليل وتشخيص", "تأهيل وعلاج طبيعي", "جلدية", "صحة المرأة", "صحة المسنين"]
    for language, country, assistant_name in catalog:
        for specialty in specialties:
            email = f"virtual-{language}-{specialty}@demo.local"
            user = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if user is None:
                cursor = db.execute("INSERT INTO users (name, email, password, role, country) VALUES (?, ?, ?, 'مساعد افتراضي', ?)", (assistant_name, email, generate_password_hash("disabled-demo-account"), country))
                user_id = cursor.lastrowid
            else:
                user_id = user["id"]
            subject = f"[{language}] سؤال افتراضي في {specialty}"
            if db.execute("SELECT id FROM questions WHERE subject = ? AND is_demo = 1", (subject,)).fetchone() is None:
                cursor = db.execute("INSERT INTO questions (user_id, subject, question, specialty, question_type, language, country, is_demo, status, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'مجاب افتراضيًا', datetime('now', '+7 days'))", (user_id, subject, f"محتوى تعليمي افتراضي باللغة {language} عن موضوع تمهيدي في {specialty}. لا يمثل استشارة أو تشخيصًا.", specialty, "مجاني", language, country))
                question_id = cursor.lastrowid
                db.execute("INSERT INTO question_answers (question_id, author_id, body, selected) VALUES (?, ?, ?, 0)", (question_id, user_id, f"إجابة تعليمية افتراضية باللغة {language} حول {specialty}. يجب مراجعة مختص موثق للحالة الفردية."))
            article_title = f"[{language}] دليل تمهيدي في {specialty}"
            if db.execute("SELECT id FROM content WHERE title = ? AND is_demo = 1", (article_title,)).fetchone() is None:
                db.execute("INSERT INTO content (author_id, title, content_type, specialty, language, country, is_demo, ai_generated, ai_label_visible, status) VALUES (?, ?, 'مقال افتراضي', ?, ?, ?, 1, 1, 1, 'منشور تجريبي')", (user_id, article_title, specialty, language, country))


def notify_user(user_id, event_type, subject, body):
    """Send only through channels explicitly configured by the account owner."""
    db = get_db()
    user = db.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()
    preferences = db.execute("SELECT * FROM notification_preferences WHERE user_id = ?", (user_id,)).fetchone()
    if user is None:
        return
    if preferences is None:
        db.execute("INSERT OR IGNORE INTO notification_preferences (user_id) VALUES (?)", (user_id,))
        db.commit()
        preferences = db.execute("SELECT * FROM notification_preferences WHERE user_id = ?", (user_id,)).fetchone()

    def log(channel, status):
        db.execute("INSERT INTO notification_log (user_id, channel, event_type, status) VALUES (?, ?, ?, ?)", (user_id, channel, event_type, status))

    smtp_host = os.environ.get("SMTP_HOST")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    if preferences["email_enabled"] and user["email"] and smtp_host and smtp_user and smtp_password:
        try:
            message = EmailMessage()
            message["Subject"], message["From"], message["To"] = subject, smtp_user, user["email"]
            message.set_content(body)
            with smtplib.SMTP(smtp_host, int(os.environ.get("SMTP_PORT", "587")), timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(message)
            log("email", "sent")
        except (OSError, smtplib.SMTPException):
            log("email", "failed")
    else:
        log("email", "not_configured")

    telegram_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if preferences["telegram_enabled"] and preferences["telegram_chat_id"] and telegram_token:
        try:
            payload = urllib.parse.urlencode({"chat_id": preferences["telegram_chat_id"], "text": f"{subject}\n{body}"}).encode()
            urllib.request.urlopen(f"https://api.telegram.org/bot{telegram_token}/sendMessage", data=payload, timeout=10).read()
            log("telegram", "sent")
        except OSError:
            log("telegram", "failed")
    else:
        log("telegram", "not_configured")

    whatsapp_url = os.environ.get("WHATSAPP_PROVIDER_URL")
    if preferences["whatsapp_enabled"] and preferences["whatsapp_number"] and whatsapp_url:
        try:
            payload = urllib.parse.urlencode({"to": preferences["whatsapp_number"], "body": f"{subject}\n{body}"}).encode()
            urllib.request.urlopen(whatsapp_url, data=payload, timeout=10).read()
            log("whatsapp", "sent")
        except OSError:
            log("whatsapp", "failed")
    else:
        log("whatsapp", "not_configured")
    db.commit()


@app.before_request
def prepare_database():
    init_db()
    if request.endpoint not in {"static", "heartbeat"}:
        db = get_db()
        session_key = request.cookies.get("session") or request.remote_addr or "anonymous"
        db.execute("INSERT INTO activity_events (user_id, session_key, event_type) VALUES (?, ?, ?)", (session.get("user_id"), session_key, request.endpoint or "request"))
        db.commit()


@app.post("/heartbeat")
def heartbeat():
    db = get_db()
    session_key = request.cookies.get("session") or request.remote_addr or "anonymous"
    db.execute("INSERT INTO activity_events (user_id, session_key, event_type) VALUES (?, ?, 'heartbeat')", (session.get("user_id"), session_key))
    db.commit()
    return {"ok": True, "online": active_user_count()}


def active_user_count():
    return get_db().execute("SELECT COUNT(DISTINCT session_key) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-5 minutes')").fetchone()[0]


def login_required(view):
    @wraps(view)
    def wrapped(**kwargs):
        if "user_id" not in session:
            flash("سجّل الدخول لإرسال سؤال أو حجز استشارة.", "notice")
            return redirect(url_for("login", next=request.path))
        return view(**kwargs)
    return wrapped


@app.context_processor
def inject_user():
    settings = {row["key"]: row["value"] for row in get_db().execute("SELECT key, value FROM platform_settings").fetchall()}
    language = session.get("language", "ar")
    language_name, direction = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["ar"])
    site_name = LOCALIZED_SITE_NAMES.get(language, settings.get("site_name", "سهلة وبسيطة"))
    return {"current_user": session.get("user_name"), "is_admin": session.get("is_admin", False), "site_settings": settings, "site_display_name": site_name, "language_code": language, "language_name": language_name, "direction": direction, "supported_languages": SUPPORTED_LANGUAGES, "doc_labels": DOCUMENT_TRANSLATIONS.get(language, DOCUMENT_TRANSLATIONS["ar"])}


@app.get("/language/<language_code>")
def set_language(language_code):
    if language_code in SUPPORTED_LANGUAGES:
        session["language"] = language_code
    return redirect(request.referrer or url_for("home"))


def admin_required(view):
    @wraps(view)
    def wrapped(**kwargs):
        admin_email = os.environ.get("ADMIN_EMAIL", "")
        if not admin_email or not session.get("user_id") or session.get("user_email") != admin_email:
            return ("غير مصرح", 403)
        return view(**kwargs)
    return wrapped


@app.get("/documents")
@login_required
def documents():
    db = get_db()
    forms = db.execute("SELECT * FROM form_templates WHERE enabled = 1 ORDER BY title").fetchall()
    contracts = db.execute("SELECT * FROM contract_templates WHERE enabled = 1 ORDER BY title").fetchall()
    signatures = db.execute("SELECT contract_signatures.*, contract_templates.title FROM contract_signatures JOIN contract_templates ON contract_templates.id = contract_signatures.contract_id WHERE contract_signatures.user_id = ? ORDER BY consented_at DESC", (session["user_id"],)).fetchall()
    return render_template("documents.html", forms=forms, contracts=contracts, signatures=signatures)


@app.post("/contracts/<int:contract_id>/sign")
@login_required
def sign_contract(contract_id):
    signature_name = request.form.get("signature_name", "").strip()
    consent = request.form.get("consent") == "1"
    contract = get_db().execute("SELECT id FROM contract_templates WHERE id = ? AND enabled = 1", (contract_id,)).fetchone()
    if contract is None or not signature_name or not consent:
        flash("يجب قراءة المسودة وكتابة الاسم والموافقة قبل التوقيع.", "error")
    else:
        db = get_db()
        db.execute("INSERT INTO contract_signatures (contract_id, user_id, signature_name, ip_address) VALUES (?, ?, ?, ?)", (contract_id, session["user_id"], signature_name, request.remote_addr))
        db.commit()
        flash("تم حفظ التوقيع الإلكتروني وسجل الموافقة.", "success")
    return redirect(url_for("documents"))


@app.route("/admin/site-settings", methods=("GET", "POST"))
@login_required
@admin_required
def admin_site_settings():
    db = get_db()
    if request.method == "POST":
        editable = {"site_name", "site_tagline", "contact_email", "contact_phone", "primary_color", "accent_color", "ad_slots", "promotion_packages"}
        for key in editable:
            db.execute("INSERT OR REPLACE INTO platform_settings (key, value) VALUES (?, ?)", (key, request.form.get(key, "").strip()))
        db.commit()
        flash("تم حفظ إعدادات الموقع والإعلانات والباقات.", "success")
    settings = {row["key"]: row["value"] for row in db.execute("SELECT key, value FROM platform_settings").fetchall()}
    return render_template("admin_site_settings.html", settings=settings)


@app.route("/admin/document-templates", methods=("GET", "POST"))
@login_required
@admin_required
def admin_document_templates():
    db = get_db()
    if request.method == "POST":
        kind = request.form.get("kind")
        item_id = request.form.get("item_id", type=int)
        title, body = request.form.get("title", "").strip(), request.form.get("body", "").strip()
        if kind == "form":
            db.execute("UPDATE form_templates SET title = ?, fields_json = ?, terms = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (title, request.form.get("fields", "").strip(), body, item_id))
        elif kind == "contract":
            db.execute("UPDATE contract_templates SET title = ?, body = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (title, body, item_id))
        db.commit()
        flash("تم تحديث قالب الوثيقة. راجع النص قانونيًا قبل اعتماده.", "success")
    forms = db.execute("SELECT * FROM form_templates ORDER BY id").fetchall()
    contracts = db.execute("SELECT * FROM contract_templates ORDER BY id").fetchall()
    return render_template("admin_document_templates.html", forms=forms, contracts=contracts)


@app.get("/")
def home():
    query = request.args.get("q", "").strip()
    country = request.args.get("country", "").strip()
    language = request.args.get("language", "").strip()
    page = max(request.args.get("page", 1, type=int), 1)
    page_size = 24
    pattern = f"%{query}%"
    db = get_db()
    clauses = ["(? = '' OR name LIKE ? OR specialty LIKE ? OR location LIKE ?)", "(? = '' OR country = ?)", "(? = '' OR language = ?)"]
    params = [query, pattern, pattern, pattern, country, country, language, language]
    where = " AND ".join(clauses)
    total = db.execute(f"SELECT COUNT(*) FROM providers WHERE {where}", params).fetchone()[0]
    providers = db.execute(f"SELECT * FROM providers WHERE {where} ORDER BY is_demo ASC, rating DESC LIMIT ? OFFSET ?", params + [page_size, (page - 1) * page_size]).fetchall()
    countries = [row[0] for row in db.execute("SELECT DISTINCT country FROM providers WHERE country != '' ORDER BY country").fetchall()]
    languages = [row[0] for row in db.execute("SELECT DISTINCT language FROM providers WHERE language != '' ORDER BY language").fetchall()]
    return render_template("index.html", providers=providers, query=query, country=country, language=language, countries=countries, languages=languages, total=total, page=page, page_size=page_size, online=active_user_count())


@app.route("/register", methods=("GET", "POST"))
def register():
    if request.method == "POST":
        name, email, password = request.form.get("name", "").strip(), request.form.get("email", "").strip().lower(), request.form.get("password", "")
        if not name or not email or len(password) < 6:
            flash("أدخل الاسم والبريد وكلمة مرور من 6 أحرف على الأقل.", "error")
        else:
            try:
                db = get_db()
                cursor = db.execute("INSERT INTO users (name, email, password, role, country, phone) VALUES (?, ?, ?, ?, ?, ?)", (name, email, generate_password_hash(password), request.form.get("role", "عميل"), request.form.get("country", "").strip(), request.form.get("phone", "").strip()))
                db.commit()
                session.clear()
                session.update(user_id=cursor.lastrowid, user_name=name, user_email=email)
                return redirect(url_for("home"))
            except sqlite3.IntegrityError:
                flash("هذا البريد مستخدم بالفعل.", "error")
    return render_template("auth.html", mode="register")


@app.route("/login", methods=("GET", "POST"))
def login():
    if request.method == "POST":
        email, password = request.form.get("email", "").strip().lower(), request.form.get("password", "")
        user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user is None or not check_password_hash(user["password"], password):
            flash("البريد أو كلمة المرور غير صحيحة.", "error")
        else:
            session.clear()
            session.update(user_id=user["id"], user_name=user["name"], user_email=user["email"], is_admin=bool(os.environ.get("ADMIN_EMAIL") == user["email"]))
            return redirect(request.args.get("next") or url_for("home"))
    return render_template("auth.html", mode="login")


@app.get("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


@app.route("/provider/<int:provider_id>", methods=("GET", "POST"))
def provider_detail(provider_id):
    db = get_db()
    provider = db.execute("SELECT * FROM providers WHERE id = ?", (provider_id,)).fetchone()
    if provider is None:
        return render_template("404.html"), 404
    if request.method == "POST":
        if "user_id" not in session:
            return redirect(url_for("login", next=request.path))
        appointment_date = request.form.get("appointment_date", "")
        if not appointment_date:
            flash("اختر موعد الاستشارة.", "error")
        else:
            cursor = db.execute("INSERT INTO consultations (user_id, provider_id, appointment_date, service_type, notes) VALUES (?, ?, ?, ?, ?)", (session["user_id"], provider_id, appointment_date, request.form.get("service_type", provider["offer"]), request.form.get("notes", "").strip()))
            db.commit()
            notify_user(session["user_id"], "consultation_requested", "طلب استشارة جديد", "تم تسجيل طلب الاستشارة بنجاح وستصلك تحديثات الحالة عبر القنوات التي فعّلتها.")
            provider_owner = db.execute("SELECT owner_user_id FROM providers WHERE id = ?", (provider_id,)).fetchone()
            if provider_owner and provider_owner["owner_user_id"]:
                notify_user(provider_owner["owner_user_id"], "consultation_requested", "طلب استشارة جديد", "وصل طلب استشارة جديد إلى مؤسستك. راجع لوحة العمل للمتابعة.")
            return redirect(url_for("consultation_room", consultation_id=cursor.lastrowid))
    return render_template("provider.html", provider=provider)


@app.route("/ask", methods=("GET", "POST"))
@login_required
def ask_question():
    if request.method == "POST":
        subject, question = request.form.get("subject", "").strip(), request.form.get("question", "").strip()
        specialty = request.form.get("specialty", "عام").strip()
        language = request.form.get("language", "العربية").strip()
        country = request.form.get("country", "").strip()
        question_type = request.form.get("question_type", "مجاني")
        if question_type not in {"مجاني", "مدفوع"}:
            question_type = "مجاني"
        minimum_length = 10 if question_type == "مجاني" else 20
        if len(subject) < 3 or len(question) < minimum_length:
            flash("اكتب عنوانًا وسؤالًا واضحًا لا يقل عن 10 أحرف.", "error")
        else:
            db = get_db()
            db.execute("INSERT INTO questions (user_id, subject, question, specialty, question_type, language, country, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+7 days'))", (session["user_id"], subject, question, specialty, question_type, language, country))
            db.commit()
            notify_user(session["user_id"], "question_created", "تم استلام سؤالك", "تم تسجيل سؤالك وسيصلك إشعار عند وجود تحديث من المختصين.")
            flash("تم استلام سؤالك وسيتم مراجعته من مختص.", "success")
            return redirect(url_for("dashboard"))
    return render_template("ask.html")


@app.get("/questions")
def question_index():
    db = get_db()
    specialty = request.args.get("specialty", "").strip()
    question_type = request.args.get("question_type", "").strip()
    language = request.args.get("language", "").strip()
    country = request.args.get("country", "").strip()
    clauses, params = ["1 = 1"], []
    if specialty:
        clauses.append("specialty = ?")
        params.append(specialty)
    if question_type in {"مجاني", "مدفوع"}:
        clauses.append("question_type = ?")
        params.append(question_type)
    if language:
        clauses.append("language = ?")
        params.append(language)
    if country:
        clauses.append("country = ?")
        params.append(country)
    questions = db.execute(f"SELECT questions.*, users.name FROM questions JOIN users ON users.id = questions.user_id WHERE {' AND '.join(clauses)} ORDER BY questions.created_at DESC", params).fetchall()
    specialties = [row[0] for row in db.execute("SELECT DISTINCT specialty FROM questions ORDER BY specialty").fetchall()]
    languages = [row[0] for row in db.execute("SELECT DISTINCT language FROM questions ORDER BY language").fetchall()]
    countries = [row[0] for row in db.execute("SELECT DISTINCT country FROM questions WHERE country != '' ORDER BY country").fetchall()]
    return render_template("questions.html", questions=questions, specialties=specialties, languages=languages, countries=countries, specialty=specialty, question_type=question_type, language=language, country=country)


@app.get("/articles")
def article_index():
    db = get_db()
    language = request.args.get("language", "").strip()
    country = request.args.get("country", "").strip()
    specialty = request.args.get("specialty", "").strip()
    clauses, params = ["content_type = 'مقال افتراضي'"], []
    for field, value in (("language", language), ("country", country), ("specialty", specialty)):
        if value:
            clauses.append(f"{field} = ?")
            params.append(value)
    articles = db.execute(f"SELECT content.*, users.name FROM content LEFT JOIN users ON users.id = content.author_id WHERE {' AND '.join(clauses)} ORDER BY created_at DESC", params).fetchall()
    languages = [row[0] for row in db.execute("SELECT DISTINCT language FROM content WHERE content_type = 'مقال افتراضي' ORDER BY language").fetchall()]
    countries = [row[0] for row in db.execute("SELECT DISTINCT country FROM content WHERE content_type = 'مقال افتراضي' ORDER BY country").fetchall()]
    specialties = [row[0] for row in db.execute("SELECT DISTINCT specialty FROM content WHERE content_type = 'مقال افتراضي' ORDER BY specialty").fetchall()]
    return render_template("articles.html", articles=articles, languages=languages, countries=countries, specialties=specialties, language=language, country=country, specialty=specialty)


@app.route("/questions/<int:question_id>", methods=("GET", "POST"))
@login_required
def question_detail(question_id):
    db = get_db()
    question = db.execute("SELECT questions.*, users.name FROM questions JOIN users ON users.id = questions.user_id WHERE questions.id = ?", (question_id,)).fetchone()
    if question is None:
        return render_template("404.html"), 404
    if request.method == "POST":
        action = request.form.get("action")
        if action == "answer":
            body = request.form.get("body", "").strip()
            if len(body) >= 10:
                db.execute("INSERT INTO question_answers (question_id, author_id, body) VALUES (?, ?, ?)", (question_id, session["user_id"], body))
        elif action == "comment":
            answer_id = request.form.get("answer_id", type=int)
            body = request.form.get("body", "").strip()
            if answer_id and body:
                db.execute("INSERT INTO answer_comments (answer_id, author_id, body) VALUES (?, ?, ?)", (answer_id, session["user_id"], body))
        elif action == "reaction":
            answer_id = request.form.get("answer_id", type=int)
            reaction = request.form.get("reaction")
            if answer_id and reaction in {"إعجاب", "عدم إعجاب"}:
                db.execute("INSERT OR REPLACE INTO answer_reactions (answer_id, user_id, reaction) VALUES (?, ?, ?)", (answer_id, session["user_id"], reaction))
        db.commit()
        return redirect(url_for("question_detail", question_id=question_id))
    answers = db.execute("SELECT question_answers.*, users.name FROM question_answers JOIN users ON users.id = question_answers.author_id WHERE question_id = ? ORDER BY selected DESC, created_at", (question_id,)).fetchall()
    comments = db.execute("SELECT answer_comments.*, users.name FROM answer_comments JOIN users ON users.id = answer_comments.author_id WHERE answer_id IN (SELECT id FROM question_answers WHERE question_id = ?) ORDER BY created_at", (question_id,)).fetchall()
    return render_template("question_detail.html", question=question, answers=answers, comments=comments)


@app.post("/questions/<int:question_id>/select")
@login_required
def select_answers(question_id):
    db = get_db()
    question = db.execute("SELECT * FROM questions WHERE id = ? AND user_id = ?", (question_id, session["user_id"])).fetchone()
    selected_ids = request.form.getlist("answer_ids")
    if question is None or len(selected_ids) > 3 or not question["expires_at"]:
        return ("طلب غير صالح", 400)
    if db.execute("SELECT datetime(?) <= datetime('now')", (question["expires_at"],)).fetchone()[0] != 1:
        flash("يمكن اختيار الإجابات بعد انتهاء مدة السؤال.", "error")
    else:
        db.execute("UPDATE question_answers SET selected = 0 WHERE question_id = ?", (question_id,))
        for answer_id in selected_ids:
            db.execute("UPDATE question_answers SET selected = 1 WHERE id = ? AND question_id = ?", (int(answer_id), question_id))
        db.commit()
        flash("تم حفظ الإجابات المختارة. يمكنك الآن إضافة بقشيش.", "success")
    return redirect(url_for("question_detail", question_id=question_id))


@app.post("/questions/<int:question_id>/tip")
@login_required
def tip_answers(question_id):
    amount = request.form.get("amount", type=float)
    answer_ids = [item.strip() for item in request.form.get("answer_ids", "").split(",") if item.strip()]
    if not amount or amount <= 0 or not answer_ids:
        return ("بيانات البقشيش غير صالحة", 400)
    db = get_db()
    share = amount / len(answer_ids)
    for answer_id in answer_ids:
        recipient = db.execute("SELECT author_id FROM question_answers WHERE id = ? AND question_id = ?", (int(answer_id), question_id)).fetchone()
        if recipient:
            db.execute("INSERT INTO tips (question_id, answer_id, payer_id, recipient_id, gross_amount, platform_amount, recipient_amount) VALUES (?, ?, ?, ?, ?, ?, ?)", (question_id, int(answer_id), session["user_id"], recipient["author_id"], share, share * 0.30, share * 0.70))
    db.commit()
    flash("سُجل البقشيش كتجربة. يلزم ربط بوابة دفع قبل تحصيل الأموال فعليًا.", "success")
    return redirect(url_for("question_detail", question_id=question_id))


@app.get("/dashboard")
@login_required
def dashboard():
    db = get_db()
    consultations = db.execute("SELECT consultations.*, providers.name, providers.specialty, providers.image FROM consultations JOIN providers ON providers.id = consultations.provider_id WHERE consultations.user_id = ? ORDER BY consultations.created_at DESC", (session["user_id"],)).fetchall()
    questions = db.execute("SELECT * FROM questions WHERE user_id = ? ORDER BY created_at DESC", (session["user_id"],)).fetchall()
    return render_template("dashboard.html", consultations=consultations, questions=questions)


@app.route("/consultation/<int:consultation_id>/room", methods=("GET", "POST"))
@login_required
def consultation_room(consultation_id):
    db = get_db()
    consultation = db.execute("SELECT consultations.*, providers.name, providers.specialty FROM consultations JOIN providers ON providers.id = consultations.provider_id WHERE consultations.id = ? AND consultations.user_id = ?", (consultation_id, session["user_id"])).fetchone()
    if consultation is None:
        return render_template("404.html"), 404
    if request.method == "POST":
        body = request.form.get("body", "").strip()
        if body:
            db.execute("INSERT INTO messages (consultation_id, user_id, body) VALUES (?, ?, ?)", (consultation_id, session["user_id"], body))
            db.commit()
    messages = db.execute("SELECT * FROM messages WHERE consultation_id = ? ORDER BY created_at", (consultation_id,)).fetchall()
    return render_template("room.html", consultation=consultation, messages=messages)


@app.get("/consultation/<int:consultation_id>/video")
@login_required
def video_room(consultation_id):
    consultation = get_db().execute("SELECT consultations.*, providers.name, providers.specialty FROM consultations JOIN providers ON providers.id = consultations.provider_id WHERE consultations.id = ? AND consultations.user_id = ?", (consultation_id, session["user_id"])).fetchone()
    if consultation is None:
        return render_template("404.html"), 404
    return render_template("video.html", consultation=consultation)


def complaint_draft(category, body):
    category_text = {
        "خدمة": "شكرًا لتوضيح مشكلة الخدمة. سنراجع تفاصيل الطلب ونتواصل مع المؤسسة المعنية للتحقق من الوقائع.",
        "دفع": "شكرًا لإبلاغنا. سنراجع سجل العملية والدفع، ولا ترسل أي بيانات بطاقة داخل الرسائل.",
        "محتوى": "شكرًا على البلاغ. سيُراجع المحتوى وفق سياسة المنصة، وسيتم اتخاذ الإجراء المناسب عند ثبوت المخالفة.",
        "خصوصية": "تم استلام بلاغ الخصوصية. سنقيّد الوصول للمعلومات ذات الصلة ونحيله إلى المالك والمشرفين للمراجعة.",
    }.get(category, "تم استلام شكواك. سيقوم فريق الدعم بمراجعتها والرد عليك بعد التحقق من التفاصيل.")
    return f"مسودة مساعدة آلية، تحتاج اعتماد المشرف: {category_text}"


@app.route("/complaints", methods=("GET", "POST"))
@login_required
def complaints():
    db = get_db()
    if request.method == "POST":
        subject = request.form.get("subject", "").strip()
        body = request.form.get("body", "").strip()
        category = request.form.get("category", "أخرى")
        if len(subject) < 3 or len(body) < 10:
            flash("اكتب عنوان الشكوى وتفاصيل لا تقل عن 10 أحرف.", "error")
        else:
            db.execute("INSERT INTO complaints (user_id, subject, body, category, ai_draft) VALUES (?, ?, ?, ?, ?)", (session["user_id"], subject, body, category, complaint_draft(category, body)))
            db.commit()
            notify_user(session["user_id"], "complaint_created", "تم استلام الشكوى", "تم استلام شكواك وستراجعها الإدارة والمشرفون.")
            flash("تم استلام الشكوى. ستراجعها الإدارة والمشرفون.", "success")
            return redirect(url_for("complaints"))
    own_complaints = db.execute("SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC", (session["user_id"],)).fetchall()
    return render_template("complaints.html", complaints=own_complaints)


@app.post("/content/<int:content_id>/event")
@login_required
def content_event(content_id):
    event_type = request.form.get("event_type", "view")
    if event_type not in {"view", "like"}:
        return ("نوع حدث غير صالح", 400)
    db = get_db()
    content = db.execute("SELECT id FROM content WHERE id = ?", (content_id,)).fetchone()
    if content is None:
        return render_template("404.html"), 404
    duplicate = db.execute("SELECT id FROM content_events WHERE content_id = ? AND user_id = ? AND event_type = ?", (content_id, session["user_id"], event_type)).fetchone()
    if duplicate is None:
        db.execute("INSERT INTO content_events (content_id, user_id, event_type) VALUES (?, ?, ?)", (content_id, session["user_id"], event_type))
        field = "views" if event_type == "view" else "real_likes"
        db.execute(f"UPDATE content SET {field} = {field} + 1 WHERE id = ?", (content_id,))
        db.execute("INSERT INTO points_ledger (user_id, amount, reason) VALUES (?, ?, ?)", (session["user_id"], 1, "تفاعل حقيقي"))
        db.commit()
    return redirect(request.referrer or url_for("home"))


@app.post("/promotions")
@login_required
def create_promotion():
    target_type = request.form.get("target_type", "content")
    target_id = request.form.get("target_id", type=int)
    budget = request.form.get("budget", type=int)
    if target_type not in {"content", "provider"} or not target_id or not budget or budget < 1:
        flash("بيانات الحملة غير صالحة.", "error")
    else:
        db = get_db()
        db.execute("INSERT INTO promotion_orders (buyer_id, target_type, target_id, budget) VALUES (?, ?, ?, ?)", (session["user_id"], target_type, target_id, budget))
        db.commit()
        flash("تم تسجيل حملة ترويجية. الترويج يزيد الظهور، ولا يضيف إعجابات أو مراجعات وهمية.", "success")
    return redirect(request.referrer or url_for("home"))


@app.get("/admin")
@login_required
@admin_required
def admin_dashboard():
    db = get_db()
    stats = {
        "users": db.execute("SELECT COUNT(*) FROM users").fetchone()[0],
        "content": db.execute("SELECT COUNT(*) FROM content").fetchone()[0],
        "ai_content": db.execute("SELECT COUNT(*) FROM content WHERE ai_generated = 1").fetchone()[0],
        "real_likes": db.execute("SELECT COUNT(*) FROM content_events WHERE event_type = 'like'").fetchone()[0],
        "promotions": db.execute("SELECT COALESCE(SUM(budget), 0) FROM promotion_orders").fetchone()[0],
        "flags": db.execute("SELECT COUNT(*) FROM moderation_events WHERE status = 'بانتظار المراجعة'").fetchone()[0],
        "complaints": db.execute("SELECT COUNT(*) FROM complaints WHERE status != 'مغلقة'").fetchone()[0],
        "online": active_user_count(),
        "activity_3h": db.execute("SELECT COUNT(*) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-3 hours')").fetchone()[0],
        "activity_10h": db.execute("SELECT COUNT(*) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-10 hours')").fetchone()[0],
        "activity_1d": db.execute("SELECT COUNT(*) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-1 day')").fetchone()[0],
        "activity_2d": db.execute("SELECT COUNT(*) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-2 days')").fetchone()[0],
        "activity_3d": db.execute("SELECT COUNT(*) FROM activity_events WHERE datetime(created_at) >= datetime('now', '-3 days')").fetchone()[0],
    }
    setting = db.execute("SELECT value FROM platform_settings WHERE key = 'allow_ai_content'").fetchone()
    agents = db.execute("SELECT * FROM moderation_agents ORDER BY id").fetchall()
    complaints = db.execute("SELECT complaints.*, users.name, users.email FROM complaints JOIN users ON users.id = complaints.user_id ORDER BY complaints.created_at DESC").fetchall()
    return render_template("admin.html", stats=stats, allow_ai=setting["value"] == "1", agents=agents, complaints=complaints)


@app.get("/admin/directory")
@login_required
@admin_required
def admin_directory():
    db = get_db()
    query = request.args.get("q", "").strip()
    role = request.args.get("role", "").strip()
    country = request.args.get("country", "").strip()
    specialty = request.args.get("specialty", "").strip()
    date_from = request.args.get("date_from", "").strip()
    date_to = request.args.get("date_to", "").strip()
    min_price = request.args.get("min_price", "").strip()
    max_price = request.args.get("max_price", "").strip()
    order = request.args.get("order", "newest")
    user_sql = "SELECT id, name, email, role, country, phone, created_at, 'user' AS record_type, '' AS specialty, '' AS service, NULL AS price FROM users WHERE 1=1"
    provider_sql = "SELECT id, name, '' AS email, 'مؤسسة' AS role, location AS country, '' AS phone, NULL AS created_at, 'provider' AS record_type, specialty, offer AS service, price FROM providers WHERE 1=1"
    user_params, provider_params = [], []
    if query:
        like = f"%{query}%"
        user_sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        provider_sql += " AND (name LIKE ? OR specialty LIKE ? OR location LIKE ? OR offer LIKE ?)"
        user_params += [like, like, like]
        provider_params += [like, like, like, like]
    if role and role != "مؤسسة":
        user_sql += " AND role = ?"
        user_params.append(role)
    if role == "مؤسسة":
        user_sql += " AND 1 = 0"
    if country:
        user_sql += " AND country LIKE ?"
        provider_sql += " AND location LIKE ?"
        user_params.append(f"%{country}%")
        provider_params.append(f"%{country}%")
    if specialty:
        provider_sql += " AND specialty LIKE ?"
        provider_params.append(f"%{specialty}%")
    if date_from:
        user_sql += " AND date(created_at) >= date(?)"
        user_params.append(date_from)
    if date_to:
        user_sql += " AND date(created_at) <= date(?)"
        user_params.append(date_to)
    if min_price:
        provider_sql += " AND price >= ?"
        provider_params.append(int(min_price))
    if max_price:
        provider_sql += " AND price <= ?"
        provider_params.append(int(max_price))
    if role and role != "مؤسسة":
        provider_sql += " AND 1 = 0"
    sort = "name COLLATE NOCASE ASC" if order == "name" else "price ASC" if order == "price" else "created_at DESC"
    if order == "price":
        user_sql += " ORDER BY name COLLATE NOCASE ASC"
        provider_sql += " ORDER BY price ASC"
    else:
        user_sql += f" ORDER BY {sort}"
        provider_sql += " ORDER BY name COLLATE NOCASE ASC" if order == "name" else " ORDER BY name COLLATE NOCASE ASC"
    records = db.execute(f"{user_sql} UNION ALL {provider_sql}", user_params + provider_params).fetchall()
    return render_template("directory.html", records=records, filters=request.args)


def run_admin_command(command):
    normalized = " ".join(command.strip().lower().split())
    db = get_db()
    if normalized in {"منع محتوى الذكاء الاصطناعي", "منع المحتوى الاصطناعي"}:
        db.execute("INSERT OR REPLACE INTO platform_settings (key, value) VALUES ('allow_ai_content', '0')")
        action, result = "update_ai_policy", "تم منع إرسال محتوى الذكاء الاصطناعي الجديد."
    elif normalized in {"السماح بمحتوى الذكاء الاصطناعي", "السماح بالمحتوى الاصطناعي"}:
        db.execute("INSERT OR REPLACE INTO platform_settings (key, value) VALUES ('allow_ai_content', '1')")
        action, result = "update_ai_policy", "تم السماح بإرسال المحتوى للمراجعة مع إبقاء الوسم ظاهرًا."
    elif normalized in {"اعرض الإحصاءات", "اعرض الاحصاءات", "إحصاءات"}:
        user_count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        provider_count = db.execute("SELECT COUNT(*) FROM providers").fetchone()[0]
        action, result = "read_stats", f"المستخدمون: {user_count}، المؤسسات: {provider_count}."
    else:
        action, result = "rejected", "الأمر غير مدعوم. استخدم: اعرض الإحصاءات، منع محتوى الذكاء الاصطناعي، السماح بمحتوى الذكاء الاصطناعي."
    db.execute("INSERT INTO admin_audit_log (admin_email, command, action, result) VALUES (?, ?, ?, ?)", (session["user_email"], command, action, result))
    db.commit()
    return result


@app.route("/admin/assistant", methods=("GET", "POST"))
@login_required
@admin_required
def admin_assistant():
    result = None
    if request.method == "POST":
        result = run_admin_command(request.form.get("command", ""))
    logs = get_db().execute("SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 30").fetchall()
    return render_template("admin_assistant.html", result=result, logs=logs)


@app.post("/admin/complaints/<int:complaint_id>")
@login_required
@admin_required
def update_complaint(complaint_id):
    status = request.form.get("status", "قيد المراجعة")
    resolution = request.form.get("resolution", "").strip()
    if status not in {"جديدة", "قيد المراجعة", "بانتظار المستخدم", "محلولة", "مغلقة"}:
        return ("حالة غير صالحة", 400)
    db = get_db()
    db.execute("UPDATE complaints SET status = ?, resolution = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (status, resolution, session.get("user_email"), complaint_id))
    db.commit()
    complaint_owner = db.execute("SELECT user_id FROM complaints WHERE id = ?", (complaint_id,)).fetchone()
    if complaint_owner:
        notify_user(complaint_owner["user_id"], "complaint_updated", "تحديث الشكوى", f"تم تحديث حالة شكواك إلى: {status}.")
    flash("تم تحديث الشكوى.", "success")
    return redirect(url_for("admin_dashboard"))


@app.post("/admin/settings/ai-content")
@login_required
@admin_required
def update_ai_policy():
    value = "1" if request.form.get("allow_ai_content") == "1" else "0"
    db = get_db()
    db.execute("INSERT OR REPLACE INTO platform_settings (key, value) VALUES ('allow_ai_content', ?)", (value,))
    db.commit()
    flash("تم تحديث سياسة المحتوى المولّد بالذكاء الاصطناعي.", "success")
    return redirect(url_for("admin_dashboard"))


@app.route("/notifications/preferences", methods=("GET", "POST"))
@login_required
def notification_preferences():
    db = get_db()
    if request.method == "POST":
        db.execute("INSERT OR REPLACE INTO notification_preferences (user_id, email_enabled, telegram_enabled, whatsapp_enabled, telegram_chat_id, whatsapp_number) VALUES (?, ?, ?, ?, ?, ?)", (session["user_id"], int(request.form.get("email_enabled") == "1"), int(request.form.get("telegram_enabled") == "1"), int(request.form.get("whatsapp_enabled") == "1"), request.form.get("telegram_chat_id", "").strip(), request.form.get("whatsapp_number", "").strip()))
        db.commit()
        flash("تم حفظ إعدادات الإشعارات.", "success")
        return redirect(url_for("notification_preferences"))
    preferences = db.execute("SELECT * FROM notification_preferences WHERE user_id = ?", (session["user_id"],)).fetchone()
    logs = db.execute("SELECT * FROM notification_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", (session["user_id"],)).fetchall()
    return render_template("notifications.html", preferences=preferences, logs=logs)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
