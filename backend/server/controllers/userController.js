const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// إنشاء وإرجاع توكن JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('خطأ: متغير البيئة JWT_SECRET غير معرف!');
    throw new Error('JWT_SECRET غير معرف');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// تسجيل مستخدم جديد
exports.registerUser = async (req, res) => {
  try {
    console.log('طلب تسجيل مستخدم جديد:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('خطأ: بيانات مفقودة في طلب التسجيل');
      return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    // التحقق من وجود مستخدم بنفس الاسم
    const userExists = await User.findOne({ username });

    if (userExists) {
      console.log('خطأ: اسم المستخدم موجود بالفعل', username);
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    console.log('إنشاء مستخدم جديد:', username);
    // إنشاء مستخدم جديد
    const user = await User.create({
      username,
      password
    });

    console.log('تم إنشاء المستخدم بنجاح، المعرف:', user._id);
    // إرجاع بيانات المستخدم مع توكن
    const token = generateToken(user._id);
    console.log('تم إنشاء توكن:', token.substring(0, 10) + '...');

    res.status(201).json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: token
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب', error: error.message });
  }
};

// تسجيل الدخول
exports.loginUser = async (req, res) => {
  try {
    console.log('طلب تسجيل دخول:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('خطأ: بيانات مفقودة في طلب تسجيل الدخول');
      return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    // البحث عن المستخدم
    console.log('البحث عن المستخدم:', username);
    const user = await User.findOne({ username }).select('+password');
    console.log('تم العثور على المستخدم:', user ? 'نعم' : 'لا');

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user) {
      console.log('المستخدم غير موجود');
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await user.matchPassword(password);
    console.log('كلمة المرور مطابقة:', isMatch ? 'نعم' : 'لا');

    if (!isMatch) {
      console.log('كلمة المرور غير صحيحة');
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // إرجاع بيانات المستخدم مع توكن
    console.log('تسجيل دخول ناجح للمستخدم:', user.username);
    const token = generateToken(user._id);
    console.log('تم إنشاء توكن:', token.substring(0, 10) + '...');

    res.json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: token
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول', error: error.message });
  }
};

// تسجيل الدخول كضيف
exports.guestLogin = async (req, res) => {
  try {
    console.log('طلب تسجيل دخول كضيف:', req.body);
    const { username } = req.body;

    if (!username) {
      console.log('خطأ: اسم المستخدم مفقود');
      return res.status(400).json({ message: 'اسم المستخدم مطلوب' });
    }

    // التحقق إذا كان اسم المستخدم موجود
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('اسم المستخدم موجود بالفعل:', username);
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر' });
    }

    console.log('محاولة إنشاء مستخدم ضيف باسم:', username);
    // إنشاء مستخدم ضيف
    const randomPassword = Math.random().toString(36).slice(-10);
    console.log('تم إنشاء كلمة مرور عشوائية:', randomPassword);

    const user = await User.create({
      username,
      password: randomPassword,
      isGuest: true
    });

    console.log('تم إنشاء المستخدم الضيف بنجاح، المعرف:', user._id);
    // إرجاع بيانات المستخدم مع توكن
    const token = generateToken(user._id);
    console.log('تم إنشاء توكن:', token.substring(0, 10) + '...');
    
    res.status(201).json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: token
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول كضيف:', error);
    
    // إرسال رسالة خطأ أكثر تفصيلاً
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر',
        error: 'duplicate_key' 
      });
    }
    
    res.status(500).json({ 
      message: 'خطأ في تسجيل الدخول كضيف', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// الحصول على معلومات المستخدم الحالي
exports.getUserProfile = async (req, res) => {
  try {
    console.log('طلب معلومات المستخدم، المعرف:', req.user._id);
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('المستخدم غير موجود');
      return res.status(404).json({ message: 'لم يتم العثور على المستخدم' });
    }

    console.log('تم العثور على معلومات المستخدم:', user.username);
    res.json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest
    });
  } catch (error) {
    console.error('خطأ في جلب معلومات المستخدم:', error);
    res.status(500).json({ message: 'خطأ في جلب معلومات المستخدم', error: error.message });
  }
};