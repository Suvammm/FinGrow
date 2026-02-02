const Goal = require('../models/Goal');

// @desc    Get all goals for logged in user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new goal
// @route   POST /api/goals
exports.setGoal = async (req, res) => {
    try {
        const { title, targetAmount, currentAmount, deadline } = req.body;

        // Debugging: This will print the user ID in your VS Code terminal
        console.log("User ID from middleware:", req.user ? req.user.id : "NOT FOUND");

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, no user found" });
        }

        const goal = await Goal.create({
            title,
            targetAmount,
            currentAmount,
            deadline,
            user: req.user.id
        });

        res.status(201).json(goal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};