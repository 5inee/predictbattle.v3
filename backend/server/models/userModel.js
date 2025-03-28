const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'اسم المستخدم مطلوب'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'],
    select: false
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  console.log('معالجة حفظ المستخدم...');
  
  // تنفيذ فقط إذا تم تعديل كلمة المرور أو إنشاء مستخدم جديد
  if (!this.isModified('password')) {
    console.log('لم يتم تعديل كلمة المرور، تخطي التشفير');
    return next();
  }
  
  try {
    console.log('تشفير كلمة المرور...');
    // تشفير كلمة المرور
    this.password = await bcrypt.hash(this.password, 12);
    console.log('تم تشفير كلمة المرور بنجاح');
    next();
  } catch (error) {
    console.error('خطأ في تشفير كلمة المرور:', error);
    next(error);
  }
});

// طريقة للتحقق من صحة كلمة المرور
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('مقارنة كلمة المرور...');
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('نتيجة المقارنة:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('خطأ في مقارنة كلمة المرور:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;