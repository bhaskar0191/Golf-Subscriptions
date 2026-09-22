const Score = require("../models/Score");

const createScore = async (req, res) => {
    try {
        const { courseName, score, stablefordPoints, format, holes, roundDate, notes } = req.body;

        if (!courseName || score === undefined || score === null) {
            return res.status(400).json({ message: "Course name and score are required" });
        }

        const newScore = await Score.create({
            user: req.user._id,
            courseName,
            score,
            stablefordPoints: stablefordPoints ?? null,
            format: format || "stableford",
            holes: holes || 18,
            roundDate: roundDate || new Date(),
            notes: notes || "",
        });

        return res.status(201).json({ message: "Score added successfully", score: newScore });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not create score" });
    }
};

const updateScore = async (req, res) => {
    try {
        const { id } = req.params;
        const score = await Score.findOne({ _id: id, user: req.user._id });

        if (!score) {
            return res.status(404).json({ message: "Score not found or not authorized" });
        }

        const allowedFields = ["courseName", "score", "stablefordPoints", "format", "holes", "roundDate", "notes"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                score[field] = req.body[field];
            }
        });

        await score.save();

        return res.status(200).json({ message: "Score updated successfully", score });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not update score" });
    }
};

const getUserScores = async (req, res) => {
    try {
        const { userId } = req.params;

        const scores = await Score.find({ user: userId }).sort({ roundDate: -1 });

        return res.status(200).json({ scores });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch scores" });
    }
};

module.exports = { createScore, updateScore, getUserScores };
