const Sheet = require('../models/sheet.model');
const {asyncHandler} = require('../utils/asyncHandler');

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