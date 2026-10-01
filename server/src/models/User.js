import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['admin', 'hod', 'class_advisor', 'faculty', 'student', 'parent'],
    required: true,
  },
  phone: { type: String, trim: true },
  identifier: { type: String, trim: true }, // Stores Roll No or Employee ID
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
  lastLogin: Date,
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
    success: Boolean,
  }],
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } },
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

// Remove sensitive data from output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.emailVerificationToken;
  return obj;
};

export default mongoose.model('User', userSchema);
