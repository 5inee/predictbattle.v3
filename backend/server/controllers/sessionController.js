const Session = require('../models/sessionModel');
const User = require('../models/userModel');

// إنشاء جلسة توقع جديدة
exports.createSession = async (req, res) => {
  try {
    console.log('محاولة إنشاء جلسة جديدة...');
    console.log('بيانات الطلب:', req.body);
    console.log('المستخدم:', req.user);
    
    const { title, maxPlayers, secretCode } = req.body;

    // التحقق من الرمز السري للإنشاء
    if (secretCode !== '021') {
      console.log('الرمز السري غير صحيح:', secretCode);
      return res.status(400).json({ message: 'الرمز السري غير صحيح' });
    }

    // إنشاء جلسة جديدة
    const session = await Session.create({
      title,
      maxPlayers,
      creator: req.user._id,
      participants: [req.user._id]
    });

    console.log('تم إنشاء الجلسة بنجاح:', session);

    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        code: session.code,
        maxPlayers: session.maxPlayers,
        participants: session.participants.length,
        isComplete: session.isComplete,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء جلسة التوقع:', error);
    res.status(500).json({ message: 'خطأ في إنشاء جلسة التوقع', error: error.message });
  }
};

// الانضمام إلى جلسة عن طريق الكود
exports.joinSession = async (req, res) => {
  try {
    const { code } = req.body;

    // البحث عن الجلسة بالكود
    const session = await Session.findOne({ code }).populate('participants', 'username');

    if (!session) {
      return res.status(404).json({ message: 'لم يتم العثور على الجلسة بهذا الكود' });
    }

    // التحقق مما إذا كان المستخدم مشاركًا بالفعل
    const isAlreadyParticipant = session.participants.some(
      participant => participant._id.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(200).json({
        success: true,
        message: 'أنت مشارك بالفعل في هذه الجلسة',
        session: {
          _id: session._id,
          title: session.title,
          code: session.code,
          maxPlayers: session.maxPlayers,
          participants: session.participants,
          predictions: session.predictions,
          isComplete: session.isComplete,
          createdAt: session.createdAt
        }
      });
    }

    // التحقق من عدم امتلاء الجلسة
    if (session.participants.length >= session.maxPlayers) {
      return res.status(400).json({ message: 'هذه الجلسة ممتلئة بالفعل' });
    }

    // إضافة المستخدم إلى المشاركين
    session.participants.push(req.user._id);
    await session.save();

    // إعادة استعلام الجلسة بعد التحديث مع بيانات المشاركين
    const updatedSession = await Session.findById(session._id)
      .populate('participants', 'username')
      .populate('predictions.user', 'username');

    res.status(200).json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('خطأ في الانضمام إلى الجلسة:', error);
    res.status(500).json({ message: 'خطأ في الانضمام إلى الجلسة', error: error.message });
  }
};

// إرسال توقع في جلسة
exports.submitPrediction = async (req, res) => {
  try {
    const { sessionId, text } = req.body;
    console.log('طلب إرسال توقع:', { sessionId, text, userId: req.user._id });

    // البحث عن الجلسة
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'لم يتم العثور على الجلسة' });
    }

    // التحقق من أن المستخدم مشارك في الجلسة
    const isParticipant = session.participants.some(
      participant => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'أنت لست مشاركًا في هذه الجلسة' });
    }

    // التحقق من أن المستخدم لم يرسل توقعًا من قبل
    const hasSubmitted = session.predictions.some(
      prediction => prediction.user.toString() === req.user._id.toString()
    );

    if (hasSubmitted) {
      return res.status(400).json({ message: 'لقد قمت بالفعل بإرسال توقع في هذه الجلسة' });
    }

    // إضافة التوقع
    session.predictions.push({
      user: req.user._id,
      text
    });

    // التحقق مما إذا كان جميع المشاركين قد قدموا توقعاتهم
    if (session.predictions.length === session.participants.length) {
      session.isComplete = true;
    }

    await session.save();

    // جلب الجلسة المحدثة مع بيانات المستخدمين
    const updatedSession = await Session.findById(sessionId)
      .populate('participants', 'username')
      .populate('predictions.user', 'username');

    console.log('تم تحديث الجلسة بنجاح:', {
      sessionId,
      predictionsCount: updatedSession.predictions.length,
      isComplete: updatedSession.isComplete
    });

    res.status(200).json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('خطأ في إرسال التوقع:', error);
    res.status(500).json({ message: 'خطأ في إرسال التوقع', error: error.message });
  }
};

// الحصول على جلسة محددة
exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('طلب جلب بيانات الجلسة:', id);

    // البحث عن الجلسة مع بيانات المستخدمين
    const session = await Session.findById(id)
      .populate('participants', 'username')
      .populate('predictions.user', 'username');

    if (!session) {
      return res.status(404).json({ message: 'لم يتم العثور على الجلسة' });
    }

    console.log('تم إرجاع بيانات الجلسة:', {
      sessionId: id,
      predictionsCount: session.predictions.length,
      participantsCount: session.participants.length
    });

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('خطأ في جلب بيانات الجلسة:', error);
    res.status(500).json({ message: 'خطأ في جلب بيانات الجلسة', error: error.message });
  }
};

// الحصول على جلسات المستخدم
exports.getUserSessions = async (req, res) => {
  try {
    // البحث عن جميع الجلسات التي يشارك فيها المستخدم
    const sessions = await Session.find({ participants: req.user._id })
      .select('title code maxPlayers participants predictions isComplete createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('خطأ في جلب الجلسات:', error);
    res.status(500).json({ message: 'خطأ في جلب الجلسات', error: error.message });
  }
};