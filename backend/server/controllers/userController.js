const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// إنشاء وإرجاع توكن JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// تسجيل مستخدم جديد
exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود مستخدم بنفس الاسم
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    // إنشاء مستخدم جديد
    const user = await User.create({
      username,
      password
    });

    // إرجاع بيانات المستخدم مع توكن
    res.status(201).json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إنشاء الحساب', error: error.message });
  }
};

// تسجيل الدخول
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ username }).select('+password');

    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // إرجاع بيانات المستخدم مع توكن
    res.json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول', error: error.message });
  }
};

// تسجيل الدخول كضيف
exports.guestLogin = async (req, res) => {
  try {
    const { username } = req.body;

    // إنشاء مستخدم ضيف
    const user = await User.create({
      username,
      password: Math.random().toString(36).slice(-10), // كلمة مرور عشوائية
      isGuest: true
    });

    // إرجاع بيانات المستخدم مع توكن
    res.status(201).json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول كضيف', error: error.message });
  }
};

// الحصول على معلومات المستخدم الحالي
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'لم يتم العثور على المستخدم' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      isGuest: user.isGuest
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب معلومات المستخدم', error: error.message });
  }
};