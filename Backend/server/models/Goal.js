const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['financial', 'receivable'],
    default: 'financial'
  },
  title: {
    type: String,
    required: [
      function() {
        return this.goalType !== 'receivable';
      },
      'Please add a goal title'
    ],
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
  },
  debtorName: {
    type: String,
    trim: true,
    default: ''
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  reminderDate: {
    type: Date,
    default: null
  },
  reminderFrequency: {
    type: String,
    enum: ['Once', 'Daily', 'Weekly'],
    default: 'Once'
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  nextReminderAt: {
    type: Date,
    default: null
  },
  lastReminderSentAt: {
    type: Date,
    default: null
  },
  reminderSentCount: {
    type: Number,
    default: 0
  },
  reminderCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Virtual field to calculate percentage completion
GoalSchema.virtual('progressPercentage').get(function() {
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

module.exports = mongoose.model('Goal', GoalSchema);
