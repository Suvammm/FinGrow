const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount']
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Please add a target date']
  },
  category: {
    type: String,
    enum: ['Short-term', 'Long-term'],
    default: 'Short-term'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, { timestamps: true });

// Virtual field to calculate percentage completion
GoalSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

module.exports = mongoose.model('Goal', GoalSchema);