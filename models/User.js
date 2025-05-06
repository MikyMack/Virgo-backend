const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  googleId: { type: String }, 
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
