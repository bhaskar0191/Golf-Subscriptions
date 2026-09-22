const User = require("../models/User");
const Draw = require("../models/Draw");
const Charity = require("../models/Charity");
const Subscription = require("../models/Subscription");

const getAdminDashboard = async (req, res) => {
    try {
        const [userStats, drawStats, charityStats, subscriptionStats] = await Promise.all([
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } },
            ]),
            Draw.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Charity.aggregate([
                { $group: { _id: "$isActive", count: { $sum: 1 } } },
            ]),
            Subscription.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);

        const totals = {
            subscribers: userStats.find((item) => item._id === "subscriber")?.count || 0,
            admins: userStats.find((item) => item._id === "admin")?.count || 0,
            totalDraws: await Draw.countDocuments(),
            activeCharities: charityStats.find((item) => item._id === true)?.count || 0,
            inactiveCharities: charityStats.find((item) => item._id === false)?.count || 0,
            activeSubscriptions: subscriptionStats.find((item) => item._id === "active")?.count || 0,
            trialSubscriptions: subscriptionStats.find((item) => item._id === "trial")?.count || 0,
            cancelledSubscriptions: subscriptionStats.find((item) => item._id === "cancelled")?.count || 0,
        };

        const latestDraws = await Draw.find().sort({ createdAt: -1 }).limit(5).populate("participants", "name email");
        const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("name email role status createdAt");
        const latestCharities = await Charity.find().sort({ createdAt: -1 }).limit(5).select("name category isActive createdAt");

        return res.status(200).json({
            totals,
            drawStatusSummary: drawStats,
            userSummary: userStats,
            charitySummary: charityStats,
            subscriptionSummary: subscriptionStats,
            latestDraws,
            latestUsers,
            latestCharities,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to load admin dashboard" });
    }
};

module.exports = { getAdminDashboard };
