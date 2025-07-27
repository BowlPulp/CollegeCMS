import mongoose from 'mongoose';

const CHOSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CHO', CHOSchema);
