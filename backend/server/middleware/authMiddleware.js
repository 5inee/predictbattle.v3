const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// حماية المسارات (التحقق من وجود توكن صالح)
exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('التحقق من المصادقة...');
    console.log('هيدرات الطلب:', req.headers);

    // التحقق من وجود التوكن في الهيدر
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // الحصول على التوكن من الهيدر
      token = req.headers.authorization.split(' ')[1];
      console.log('تم العثور على التوكن:', token.substring(0, 10) + '...');
    }

    // التحقق من وجود التوكن
    if (!token) {
      console.log('لا يوجد توكن');
      return res.status(401).json({ message: 'غير مصرح لك بالوصول، يرجى تسجيل الدخول' });
    }

    // التحقق من صحة التوكن
    console.log('جاري التحقق من صحة التوكن...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('تم فك تشفير التوكن:', decoded);

    // الحصول على بيانات المستخدم من التوكن
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('المستخدم غير موجود للمعرف:', decoded.id);
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    console.log('تم التحقق من المستخدم بنجاح:', user.username);

    // إضافة بيانات المستخدم إلى الطلب
    req.user = user;
    next();
  } catch (error) {
    console.error('خطأ في المصادقة:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'التوكن غير صالح' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'انتهت صلاحية التوكن' });
    }
    res.status(500).json({ message: 'خطأ في المصادقة', error: error.message });
  }
};