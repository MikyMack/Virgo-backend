const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `Virgo <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
