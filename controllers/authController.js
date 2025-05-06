const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendOtpEmail = require("../utils/sendOtpEmail");
const bcrypt = require('bcryptjs');


const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// OTP generation function
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  };
  
  // Register or login with OTP
  exports.loginOrRegister = async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      let user = await User.findOne({ email });

      const otp = generateOtp();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

      if (!user) {
        // If user doesn't exist, register the user and save first
        user = new User({ email });
        await user.save();
        // Now set OTP and save again
        user.otp = { code: otp, expiresAt: otpExpiresAt };
      } else {
        // If user exists, we just update the OTP field
        user.otp = { code: otp, expiresAt: otpExpiresAt };
      }

      await user.save();

      // Send OTP to the user's email
      await sendOtpEmail(email, otp);

      return res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (err) {
      return res.status(500).json({ message: 'Error processing your request', error: err.message });
    }
  };
  
  // Verify OTP and log the user in/register the user
  exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || !user.otp || user.otp.code !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({ message: 'OTP has expired' });
      }
  
      user.isVerified = true;
      user.otp = undefined; // Clear OTP after successful verification
      await user.save();
  
      // You can generate a JWT token for the user if needed
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
      res.status(200).json({
        message: 'User verified successfully',
        token,
        user: { id: user._id, email: user.email, role: user.role }
      });
    } catch (err) {
      return res.status(500).json({ message: 'Verification failed', error: err.message });
    }
  };

exports.adminLogin = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    
    let isAdmin = false;
    if (Array.isArray(user.role)) {
      isAdmin = user.role.includes("admin");
    } else {
      isAdmin = user.role === "admin";
    }

    if (!isAdmin) {
      return res.status(401).json({ message: "Access denied" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = { code: otp, expiresAt: otpExpiresAt };
    await user.save();

    // Send OTP to admin's email
    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to admin email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.adminVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
console.log(req.body);

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Access denied" });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = undefined; // Clear OTP after successful verification
    await user.save();

    // Generate JWT token for admin
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: "Admin verified successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};
