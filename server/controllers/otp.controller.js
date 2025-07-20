const Otp = require("../models/otp.model");
const nodemailer = require("nodemailer");
const User = require("../models/staff.model"); // adjust as needed
const bcrypt = require("bcrypt");

// Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found with this email." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTPs
    await Otp.deleteMany({ email });

    // Save new OTP
    await Otp.create({ email, otp });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    // Send email
  await transporter.sendMail({
  from: `"CCMS" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "CCMS - OTP for Password Reset",
  text: `Your OTP is: ${otp}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px;">
      <h2 style="color: #333333; font-weight: normal;">Password Reset Request</h2>
      <p style="font-size: 15px; color: #555555;">We received a request to reset your password for the CCMS account associated with this email.</p>
      <p style="font-size: 15px; color: #555555;">Please use the following One-Time Password (OTP) to proceed:</p>
      <p style="font-size: 24px; font-weight: bold; color: #000000; background-color: #f2f2f2; padding: 10px 20px; border-radius: 4px; display: inline-block;">${otp}</p>
      <p style="font-size: 14px; color: #777777; margin-top: 20px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      <p style="font-size: 14px; color: #999999; margin-top: 30px;">– CCMS Team</p>
    </div>
  `,
});



    res.status(200).json({ success: true, message: "OTP sent successfully." });

  } catch (err) {
    console.error("OTP sending error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // OTP is valid, delete it
    await Otp.deleteMany({ email });

    res.status(200).json({ success: true, message: "OTP verified successfully." });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ success: false, message: "OTP verification failed." });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword)
    return res.status(400).json({ message: "Email and new password are required." });

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, message: "Password reset successful." });

  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ success: false, message: "Password reset failed." });
  }
};
