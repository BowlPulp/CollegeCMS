const Staff = require('../models/staff.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// Helper: Find staff by email or staffId
const findStaff = async (identifier) => {
  return await Staff.findOne({
    $or: [
      { email: identifier },
      { staffId: identifier }
    ]
  });
};

// Register Controller
const register = asyncHandler(async (req, res, next) => {
  const { email, name, password, staffId, contactNo, role } = req.body;
  if (!email || !name || !password || !staffId || !contactNo || !role) {
    throw new ApiError(400, 'All fields are required');
  }
  // Check if staff exists
  const existing = await findStaff(email) || await findStaff(staffId);
  if (existing) {
    throw new ApiError(409, 'Staff with this email or staffId already exists');
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // TODO: Generate and send OTP here, hash OTP and set expiry
  const staff = await Staff.create({
    email,
    name,
    password: hashedPassword,
    staffId,
    contactNo,
    role,
    isVerified: false // Set to true after OTP verification
  });
  res.status(201).json(new ApiResponse(201, staff, 'Registration successful. Please verify OTP.'));
});

// Login Controller
const login = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body; // identifier = email or staffId
  if (!identifier || !password) {
    throw new ApiError(400, 'Identifier and password are required');
  }
  const staff = await findStaff(identifier);
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }
  // Check password
  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }
  // Check OTP verification
  if (!staff.isVerified) {
    throw new ApiError(403, 'Account not verified. Please verify OTP.');
  }
  // Generate JWT
  const token = jwt.sign(
    { id: staff._id, role: staff.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    })
    .status(200)
    .json(new ApiResponse(200, staff, 'Login successful'));
});

// Get current user from cookie
const me = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new ApiError(401, 'No token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const staff = await Staff.findById(decoded.id).select('-password -otp');
    if (!staff) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json(new ApiResponse(200, staff, 'User session valid'));
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

// Logout controller
const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    expires: new Date(0), // Expire immediately
  });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

module.exports = { register, login, me, logout };
