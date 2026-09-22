const User = require("../models/User");

const getProfile = async (req, res) => {
    try {
        return res.status(200).json({ user: req.user.toPublicJSON() });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "email",
            "phone",
            "preferences",
            "status",
            "subscriptionPlan",
            "billingCycle",
            "subscriptionStatus",
            "subscriptionStartDate",
            "subscriptionEndDate",
        ];
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid profile fields provided" });
        }

        if (updates.email) {
            const emailTaken = await User.findOne({
                email: updates.email.toLowerCase(),
                _id: { $ne: req.user._id },
            });

            if (emailTaken) {
                return res.status(409).json({ message: "Email is already in use" });
            }

            updates.email = updates.email.toLowerCase();
        }

        if (updates.password) {
            return res.status(400).json({ message: "Password updates must be handled through a separate flow" });
        }

        Object.assign(req.user, updates);
        await req.user.save();

        return res.status(200).json({ user: req.user.toPublicJSON() });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Profile update failed" });
    }
};

const subscribeToPlatform = async (req, res) => {
    try {
        const { plan, billingCycle } = req.body;

        if (!plan || !["monthly", "yearly"].includes(plan)) {
            return res.status(400).json({ message: "Valid subscription plan is required: monthly or yearly" });
        }

        const selectedCycle = billingCycle || plan;
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + (selectedCycle === "yearly" ? 12 : 1));

        req.user.subscriptionPlan = plan;
        req.user.billingCycle = selectedCycle;
        req.user.subscriptionStatus = "active";
        req.user.subscriptionStartDate = now;
        req.user.subscriptionEndDate = endDate;

        await req.user.save();

        return res.status(200).json({
            message: "Subscription updated successfully",
            user: req.user.toPublicJSON(),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Subscription update failed" });
    }
};

module.exports = { getProfile, updateProfile, subscribeToPlatform };
