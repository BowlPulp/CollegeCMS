const Timetable = require("../models/timetable.model");

// CREATE
exports.createTimetable = async (req, res) => {
  try {
    const { teacherName, uploadedBy, uploadedByName, fileUrl, fileType } = req.body;
    if (!fileUrl) return res.status(400).json({ error: "Cloudinary URL is required" });

    const timetable = new Timetable({
      teacherName,
      fileUrl,
      fileType,
      uploadedBy,
      uploadedByName,
    });
    await timetable.save();

    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// GET ALL
exports.getTimetables = async (req, res) => {
  try {
    const { search, from, to, sort = "desc" } = req.query;
    const query = {};
    if (search)
      query.teacherName = { $regex: search, $options: "i" };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const timetables = await Timetable.find(query).sort({
      createdAt: sort === "desc" ? -1 : 1,
    });
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch timetables" });
  }
};

// DELETE
exports.deleteTimetable = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
