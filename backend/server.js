const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();

// Middleware
// تكوين CORS للسماح بالطلبات من الواجهة الأمامية
app.use(cors({
  origin: ['http://localhost:3000', 'https://predict-battle.vercel.app', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تحديد المنفذ
const PORT = process.env.PORT || 5000;

// Middleware لتسجيل الطلبات
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  
  if (req.headers.authorization) {
    console.log('Headers:', { 
      ...req.headers, 
      authorization: req.headers.authorization.substring(0, 20) + '...' 
    });
  } else {
    console.log('Headers:', req.headers);
  }
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  
  next();
});

// مسار الفحص الصحي للخادم - متاح دائمًا حتى قبل الاتصال بقاعدة البيانات
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'الخادم يعمل بنجاح!', 
    timestamp: new Date().toISOString() 
  });
});

// مسار اختبار قاعدة البيانات
app.get('/api/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'غير متصل',
    1: 'متصل',
    2: 'جاري الاتصال',
    3: 'قطع الاتصال'
  };
  
  res.json({
    server: 'يعمل',
    database: {
      state: dbState,
      status: states[dbState] || 'غير معروف',
      uri_defined: !!process.env.MONGODB_URI
    },
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT
    }
  });
});

// استيراد مسارات API
const userRoutes = require('./server/routes/userRoutes');
const sessionRoutes = require('./server/routes/sessionRoutes');

// استخدام المسارات
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('خطأ عام في الخادم:', err);
  res.status(500).json({ 
    message: 'حدث خطأ في الخادم', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'خطأ داخلي' 
  });
});

// بدء تشغيل الخادم أولاً، ثم الاتصال بقاعدة البيانات
const server = app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`للوصول إلى الخادم: http://localhost:${PORT}`);
  
  // الاتصال بقاعدة البيانات بعد بدء تشغيل الخادم
  connectToDatabase();
});

// دالة الاتصال بقاعدة البيانات
async function connectToDatabase() {
  try {
    console.log('جاري محاولة الاتصال بقاعدة البيانات...');
    
    if (!process.env.MONGODB_URI) {
      console.error('خطأ: متغير البيئة MONGODB_URI غير معرف!');
      console.error('المتغيرات المتاحة:', Object.keys(process.env));
      return;
    }
    
    console.log('عنوان الاتصال موجود، طوله:', process.env.MONGODB_URI.length);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    console.error('سيستمر الخادم في العمل، لكن قد لا تعمل بعض الوظائف التي تتطلب قاعدة البيانات');
    
    // إعادة المحاولة بعد فترة
    setTimeout(connectToDatabase, 5000);
  }
}

// معالجة الإغلاق الآمن
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('تم استلام إشارة إيقاف، سيتم إغلاق الخادم بشكل آمن...');
  server.close(() => {
    console.log('تم إغلاق جميع الاتصالات');
    mongoose.connection.close(false, () => {
      console.log('تم إغلاق اتصال قاعدة البيانات');
      process.exit(0);
    });
  });
}