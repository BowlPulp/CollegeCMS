const Sheet = require('../models/sheet.model');
const {asyncHandler} = require('../utils/asyncHandler');
const Staff = require('../models/staff.model');

// Get all sheets
exports.getAllSheets = asyncHandler(async (req, res) => {
  const sheets = await Sheet.find().sort({ uploadDate: -1 });
  res.json(sheets);
});

// Create a new sheet
exports.createSheet = asyncHandler(async (req, res) => {
  const { title, description, originalLink, embeddableLink, uploadedBy, userId } = req.body;
  if (!title || !description || !originalLink || !embeddableLink || !uploadedBy || !userId) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  const uploadDate = new Date();
  const createdAt = uploadDate.toLocaleString();
  const sheet = await Sheet.create({
    title,
    description,
    originalLink,
    embeddableLink,
    uploadedBy,
    userId,
    uploadDate,
    createdAt
  });
  res.status(201).json(sheet);
});

// Delete a sheet by ID
exports.deleteSheet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sheet = await Sheet.findByIdAndDelete(id);
  if (!sheet) {
    return res.status(404).json({ message: 'Sheet not found.' });
  }
  res.json({ message: 'Sheet deleted successfully.' });
});

// Get pinned sheets for current user
exports.getPinnedSheets = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  const staff = await Staff.findById(userId);
  if (!staff) return res.status(404).json({ message: 'User not found' });
  const pinnedSheets = staff.pinnedSheets || [];
  // Optionally, populate sheet details:
  const sheets = await Sheet.find({ _id: { $in: pinnedSheets } });
  // Return in the order of pinnedSheets
  const sheetsMap = Object.fromEntries(sheets.map(s => [s._id.toString(), s]));
  const ordered = pinnedSheets.map(id => sheetsMap[id]).filter(Boolean);
  res.json(ordered);
});

// Pin a sheet
exports.pinSheet = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { sheetId } = req.body;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  if (!sheetId) return res.status(400).json({ message: 'sheetId required' });
  const staff = await Staff.findById(userId);
  if (!staff) return res.status(404).json({ message: 'User not found' });
  if (!staff.pinnedSheets.includes(sheetId)) {
    staff.pinnedSheets.unshift(sheetId);
    await staff.save();
  }
  res.json({ message: 'Sheet pinned' });
});

// Unpin a sheet
exports.unpinSheet = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { sheetId } = req.body;
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });
  if (!sheetId) return res.status(400).json({ message: 'sheetId required' });
  const staff = await Staff.findById(userId);
  if (!staff) return res.status(404).json({ message: 'User not found' });
  staff.pinnedSheets = staff.pinnedSheets.filter(id => id !== sheetId);
  await staff.save();
  res.json({ message: 'Sheet unpinned' });
}); 