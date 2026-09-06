import os
import sqlite3
from functools import wraps

from flask import Flask, flash, g, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "development-only-change-me")
app.config["DATABASE"] = os.environ.get(
    "DATABASE_PATH", os.path.join(os.path.dirname(__file__), "booking.db")
)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_error=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS stays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            price INTEGER NOT NULL,
            rating REAL NOT NULL,
            image TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            stay_id INTEGER NOT NULL,
            check_in TEXT NOT NULL,
            check_out TEXT NOT NULL,
            guests INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (stay_id) REFERENCES stays (id)
        );
        """
    )
    if db.execute("SELECT COUNT(*) FROM stays").fetchone()[0] == 0:
        db.executemany(
            "INSERT INTO stays (name, location, description, price, rating, image) VALUES (?, ?, ?, ?, ?, ?)",
            [
                ("بيت المرجان", "دهب، مصر", "إقامة هادئة على مقربة من البحر مع شرفة واسعة وإطلالة مفتوحة.", 68, 4.9, "coral"),
                ("دار النخيل", "مراكش، المغرب", "رياض تقليدي دافئ في قلب المدينة القديمة، مناسب للرحلات الهادئة.", 54, 4.8, "palm"),
                ("شاليه الضباب", "صلالة، عُمان", "مساحة مريحة وسط الطبيعة، مع جلسة خارجية وخصوصية للعائلة.", 82, 4.7, "mist"),
            ],
        )
    db.commit()


@app.before_request
def prepare_database():
    init_db()


def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if "user_id" not in session:
            flash("سجّل الدخول أولًا لإتمام الحجز.", "notice")
            return redirect(url_for("login", next=request.path))
        return view(**kwargs)

    return wrapped_view


@app.context_processor
def inject_user():
    return {"current_user": session.get("user_name")}


@app.get("/")
def home():
    query = request.args.get("q", "").strip()
    db = get_db()
    if query:
        stays = db.execute(
            "SELECT * FROM stays WHERE name LIKE ? OR location LIKE ? ORDER BY rating DESC",
            (f"%{query}%", f"%{query}%"),
        ).fetchall()
    else:
        stays = db.execute("SELECT * FROM stays ORDER BY rating DESC").fetchall()
    return render_template("index.html", stays=stays, query=query)


@app.route("/register", methods=("GET", "POST"))
def register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if not name or not email or len(password) < 6:
            flash("أدخل الاسم والبريد وكلمة مرور من 6 أحرف على الأقل.", "error")
        else:
            try:
                db = get_db()
                cursor = db.execute(
                    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                    (name, email, generate_password_hash(password)),
                )
                db.commit()
                session.clear()
                session["user_id"] = cursor.lastrowid
                session["user_name"] = name
                return redirect(url_for("home"))
            except sqlite3.IntegrityError:
                flash("هذا البريد مستخدم بالفعل.", "error")
    return render_template("auth.html", mode="register")


@app.route("/login", methods=("GET", "POST"))
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = get_db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if user is None or not check_password_hash(user["password"], password):
            flash("البريد أو كلمة المرور غير صحيحة.", "error")
        else:
            session.clear()
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            return redirect(request.args.get("next") or url_for("home"))
    return render_template("auth.html", mode="login")


@app.get("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


@app.route("/stay/<int:stay_id>", methods=("GET", "POST"))
def stay_detail(stay_id):
    db = get_db()
    stay = db.execute("SELECT * FROM stays WHERE id = ?", (stay_id,)).fetchone()
    if stay is None:
        return render_template("404.html"), 404
    if request.method == "POST":
        if "user_id" not in session:
            return redirect(url_for("login", next=request.path))
        check_in = request.form.get("check_in", "")
        check_out = request.form.get("check_out", "")
        guests = request.form.get("guests", "1")
        if not check_in or not check_out or int(guests) < 1 or check_out <= check_in:
            flash("تحقق من التواريخ وعدد الضيوف.", "error")
        else:
            db.execute(
                "INSERT INTO bookings (user_id, stay_id, check_in, check_out, guests) VALUES (?, ?, ?, ?, ?)",
                (session["user_id"], stay_id, check_in, check_out, int(guests)),
            )
            db.commit()
            flash("تم تأكيد طلب الحجز بنجاح.", "success")
            return redirect(url_for("bookings"))
    return render_template("stay.html", stay=stay)


@app.get("/bookings")
@login_required
def bookings():
    user_bookings = get_db().execute(
        """SELECT bookings.*, stays.name, stays.location, stays.image
           FROM bookings JOIN stays ON stays.id = bookings.stay_id
           WHERE bookings.user_id = ? ORDER BY bookings.created_at DESC""",
        (session["user_id"],),
    ).fetchall()
    return render_template("bookings.html", bookings=user_bookings)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
