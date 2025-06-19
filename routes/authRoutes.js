const express = require('express');
const { verifyOtp,loginOrRegister,adminLogin,adminVerifyOtp } = require('../controllers/authController');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const cloudinary = require('../utils/cloudinary');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
    const { token } = req.body;
  
    try {
      // Verify Google ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      const { email, name, sub: googleId, picture } = payload;
  
      // Check if user exists
      let user = await User.findOne({ email });
  
      // If not, create user
      if (!user) {
        try {
          // Upload profile picture to cloudinary
          const uploadResponse = await cloudinary.uploader.upload(picture, {
            folder: 'avatars',
          });

          user = await User.create({
            name,
            email,
            googleId, 
            avatar: uploadResponse.secure_url,
            role: 'user',
            isVerified: true // Set verified since it's Google login
          });
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          // Create user with default avatar if upload fails
          user = await User.create({
            name,
            email,
            googleId,
            role: 'user',
            isVerified: true
          });
        }
      }
  
      // Generate JWT
      const authToken = generateToken(user);

      res.status(200).json({ 
        success: true,
        token: authToken,  
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        }
      });
  
    } catch (err) {
      console.error('Google Login Error:', err);
      res.status(401).json({ 
        success: false,
        message: 'Authentication failed. Please try again.' 
      });
    }
  });

// OTP login or registration route
router.post('/login-or-register', loginOrRegister);

// OTP verification route
router.post('/verify-otp', verifyOtp);

router.post("/admin/login", adminLogin);
// router.post("/admin/login", adminLogin);
router.post("/admin/verify-otp",adminVerifyOtp );


module.exports = router;