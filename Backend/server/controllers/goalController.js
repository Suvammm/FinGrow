const Goal = require('../models/Goal');
const { isReminderEmailConfigured } = require('../services/reminderMailer');

const parseDateValue = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// @desc    Get all goals for logged in user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
exports.setGoal = async (req, res) => {
    try {
        const {
            goalType = 'financial',
            title,
            targetAmount,
            currentAmount,
            deadline,
            debtorName,
            reason,
            recipientEmail,
            reminderDate,
            reminderFrequency,
        } = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, no user found" });
        }

        if (!targetAmount || !deadline) {
            return res.status(400).json({ message: 'Target amount and deadline are required' });
        }

        if (goalType === 'receivable') {
            if (!debtorName || !String(debtorName).trim()) {
                return res.status(400).json({ message: 'Person name is required for receivable reminders' });
            }

            if (!reason || !String(reason).trim()) {
                return res.status(400).json({ message: 'Reason is required for receivable reminders' });
            }

            if (!recipientEmail || !String(recipientEmail).trim()) {
                return res.status(400).json({ message: 'Gmail address is required for receivable reminders' });
            }

            if (!reminderDate) {
                return res.status(400).json({ message: 'Reminder date is required for receivable reminders' });
            }
        } else if (!title || !String(title).trim()) {
            return res.status(400).json({ message: 'Goal title is required' });
        }

        const reminderEnabled = goalType === 'receivable';
        const deadlineDate = parseDateValue(deadline);

        if (!deadlineDate) {
            return res.status(400).json({ message: 'Please provide a valid deadline date' });
        }

        const reminderDateValue = reminderEnabled ? parseDateValue(reminderDate) : null;

        if (reminderEnabled && !reminderDateValue) {
            return res.status(400).json({ message: 'Please provide a valid reminder date and time' });
        }

        const goal = await Goal.create({
            title: goalType === 'receivable' ? `Collect from ${String(debtorName).trim()}` : String(title).trim(),
            targetAmount: Number(targetAmount),
            currentAmount: goalType === 'receivable' ? 0 : Number(currentAmount) || 0,
            deadline: deadlineDate,
            user: req.user.id,
            goalType,
            debtorName: goalType === 'receivable' ? String(debtorName).trim() : '',
            reason: goalType === 'receivable' ? String(reason).trim() : '',
            recipientEmail: goalType === 'receivable' ? String(recipientEmail).trim().toLowerCase() : '',
            reminderDate: reminderDateValue,
            reminderFrequency: reminderEnabled ? (reminderFrequency || 'Once') : 'Once',
            reminderEnabled,
            nextReminderAt: reminderDateValue,
            reminderCompleted: false,
        });

        res.status(201).json({
            ...goal.toObject(),
            emailReady: reminderEnabled ? isReminderEmailConfigured(req.user) : false,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a goal for logged in user
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        await goal.deleteOne();
        res.status(200).json({ message: 'Goal deleted', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
