# النشر من الكمبيوتر إلى GitHub

## الطريقة السريعة
1. فك ضغط ملف المشروع.
2. افتح المجلد.
3. ارفع محتوياته إلى Repository جديد في GitHub.
4. افتح Settings → Pages.
5. اختر Branch: `main` وFolder: `/root`.
6. احفظ وانتظر رابط الموقع.

## تشغيل محلي
داخل مجلد المشروع:

```bash
python3 -m http.server 8000
```

ثم افتح `http://localhost:8000`.

## ربط Backend لاحقاً
يمكن ربط المشروع بـ Supabase أو Backend مستقل. ملف `supabase/schema.sql` نقطة بداية فقط، ويجب إضافة Authentication وRLS وStorage وRealtime قبل تخزين بيانات حقيقية.

## أمان
لا تضع مفاتيح الدفع أو KYC أو AI السرية في JavaScript أو GitHub. استخدم متغيرات بيئية وBackend آمن.
