const Goal = require('../models/Goal');
const { sendReceivableReminderEmail, isReminderEmailConfigured } = require('./reminderMailer');

const addInterval = (dateValue, frequency) => {
  const next = new Date(dateValue);

  if (frequency === 'Daily') {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (frequency === 'Weekly') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  return null;
};

const processReceivableReminders = async () => {
  if (!isReminderEmailConfigured()) {
    return;
  }

  const now = new Date();
  const dueReminders = await Goal.find({
    goalType: 'receivable',
    reminderEnabled: true,
    reminderCompleted: false,
    nextReminderAt: { $ne: null, $lte: now },
  }).populate('user', 'name email');

  for (const reminder of dueReminders) {
    const recipientAddress = reminder.recipientEmail || reminder.user?.email;

    if (!recipientAddress) {
      continue;
    }

    try {
      await sendReceivableReminderEmail({
        to: recipientAddress,
        userName: reminder.user.name,
        debtorName: reminder.debtorName,
        amount: reminder.targetAmount,
        reason: reminder.reason,
        deadline: reminder.deadline,
        reminderFrequency: reminder.reminderFrequency,
      });

      reminder.lastReminderSentAt = now;
      reminder.reminderSentCount = (reminder.reminderSentCount || 0) + 1;

      const nextReminderAt = addInterval(now, reminder.reminderFrequency);
      if (!nextReminderAt) {
        reminder.nextReminderAt = null;
        reminder.reminderCompleted = true;
      } else if (reminder.deadline && nextReminderAt > reminder.deadline) {
        reminder.nextReminderAt = null;
        reminder.reminderCompleted = true;
      } else {
        reminder.nextReminderAt = nextReminderAt;
      }

      await reminder.save();
    } catch (error) {
      console.error(`Receivable reminder failed for goal ${reminder._id}: ${error.message}`);
    }
  }
};

const startReceivableReminderJob = () => {
  const intervalMs = Number(process.env.REMINDER_JOB_INTERVAL_MS || 60000);

  processReceivableReminders().catch((error) => {
    console.error(`Initial receivable reminder run failed: ${error.message}`);
  });

  setInterval(() => {
    processReceivableReminders().catch((error) => {
      console.error(`Receivable reminder run failed: ${error.message}`);
    });
  }, intervalMs);
};

module.exports = {
  startReceivableReminderJob,
};
