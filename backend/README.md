# PredictBattle Backend API

واجهة برمجة التطبيقات الخلفية لمنصة PredictBattle للتوقعات الجماعية.

## الإعداد

1. قم بتثبيت الاعتماديات:
npm install

2. قم بإنشاء ملف `.env` في المجلد الجذر وأضف المتغيرات البيئية التالية:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

3. تشغيل الخادم:
- للتطوير:
  ```
  npm run dev
  ```
- للإنتاج:
  ```
  npm start
  ```

## نقاط النهاية API

### المستخدمين

- `POST /api/users/register` - تسجيل مستخدم جديد
- `POST /api/users/login` - تسجيل الدخول
- `POST /api/users/guest` - تسجيل الدخول كضيف
- `GET /api/users/profile` - الحصول على معلومات المستخدم الحالي

### الجلسات

- `POST /api/sessions/create` - إنشاء جلسة توقع جديدة
- `POST /api/sessions/join` - الانضمام إلى جلسة بواسطة الكود
- `POST /api/sessions/predict` - إرسال توقع في جلسة
- `GET /api/sessions/:id` - الحصول على بيانات جلسة محددة
- `GET /api/sessions/mysessions` - الحصول على جلسات المستخدم