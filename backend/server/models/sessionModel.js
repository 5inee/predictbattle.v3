const mongoose = require('mongoose');

// مخطط لتوقع واحد
const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// مخطط لجلسة توقع
const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'عنوان الجلسة (سؤال) مطلوب'],
    trim: true
  },
  code: {
    type: String,
    unique: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true,
    min: 2,
    max: 20
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  predictions: [predictionSchema],
  isComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء كود عشوائي مكون من 6 أحرف
sessionSchema.pre('save', function(next) {
  console.log('بدء حفظ جلسة جديدة...');
  console.log('هل الجلسة جديدة؟', this.isNew);
  console.log('القيمة الحالية للكود:', this.code);

  if (this.isNew && !this.code) {
    console.log('إنشاء كود عشوائي...');
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.code = code;
    console.log('تم إنشاء الكود:', this.code);
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;