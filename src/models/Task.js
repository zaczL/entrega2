const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING',
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
});

module.exports = mongoose.model('Task', taskSchema);
