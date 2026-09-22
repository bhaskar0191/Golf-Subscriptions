const User = require("../models/User");
const Draw = require("../models/Draw");
const Charity = require("../models/Charity");

const getUserReport = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeSubscribers = await User.countDocuments({ role: "subscriber", status: "active" });
        const inactiveSubscribers = await User.countDocuments({ role: "subscriber", status: "inactive" });
        const admins = await User.countDocuments({ role: "admin" });

        return res.status(200).json({
            totalUsers,
            activeSubscribers,
            inactiveSubscribers,
            admins,
            subscribersByStatus: {
                active: activeSubscribers,
                inactive: inactiveSubscribers,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch user report" });
    }
};

const getDrawReport = async (req, res) => {
    try {
        const totalDraws = await Draw.countDocuments();
        const totalParticipants = await Draw.aggregate([
            { $unwind: "$participants" },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);
        const totalWinners = await Draw.aggregate([
            { $unwind: "$winners" },
            { $group: { _id: null, count: { $sum: 1 } } },
        ]);

        const draws = await Draw.find().sort({ createdAt: -1 });
        const outcomeSummary = {
            draft: 0,
            running: 0,
            closed: 0,
            verified: 0,
        };

        draws.forEach((draw) => {
            if (outcomeSummary[draw.status] !== undefined) {
                outcomeSummary[draw.status] += 1;
            }
        });

        return res.status(200).json({
            totalDraws,
            totalParticipants: totalParticipants[0]?.count || 0,
            totalWinners: totalWinners[0]?.count || 0,
            outcomeSummary,
            draws: draws.map((draw) => ({
                _id: draw._id,
                title: draw.title,
                status: draw.status,
                winnerCount: draw.winnerCount,
                participantsCount: draw.participants.length,
                winnersCount: draw.winners.length,
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch draw report" });
    }
};

const getCharityReport = async (req, res) => {
    try {
        const totalCharities = await Charity.countDocuments({ isActive: true });
        const categorySummary = await Charity.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const charities = await Charity.find({ isActive: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            totalCharities,
            categorySummary,
            charities: charities.map((charity) => ({
                _id: charity._id,
                name: charity.name,
                category: charity.category,
                isActive: charity.isActive,
                createdAt: charity.createdAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch charity report" });
    }
};

module.exports = { getUserReport, getDrawReport, getCharityReport };
