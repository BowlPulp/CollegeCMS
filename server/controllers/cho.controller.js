import CHO from '../models/cho.model.js';

export const getAllCHOs = async (req, res) => {
  try {
    const chos = await CHO.find().sort({ createdAt: -1 });
    res.json(chos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CHOs' });
  }
};

export const addCHO = async (req, res) => {
  const { title, description, fileUrl, fileType } = req.body;

  if (!title || !description || !fileUrl || !fileType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newCHO = new CHO({ title, description, fileUrl, fileType });
    await newCHO.save();
    res.status(201).json(newCHO);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add CHO' });
  }
};

export const deleteCHO = async (req, res) => {
  try {
    await CHO.findByIdAndDelete(req.params.id);
    res.json({ message: 'CHO deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete CHO' });
  }
};
