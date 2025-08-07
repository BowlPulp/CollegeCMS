const express = require("express");
const router = express.Router();
const multer = require("multer");
const timetableController = require("../controllers/timetable.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), timetableController.createTimetable);
router.get("/", timetableController.getTimetables);
router.delete("/:id", timetableController.deleteTimetable);

module.exports = router;
