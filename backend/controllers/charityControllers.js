const Charity = require("../models/Charity");
const User = require("../models/User");

const getCharities = async (req, res) => {
    try {
        const charities = await Charity.find({ isActive: true }).sort({ createdAt: -1 });
        return res.status(200).json({ charities });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch charities" });
    }
};

const selectCharity = async (req, res) => {
    try {
        const { charityId } = req.body;

        if (!charityId) {
            return res.status(400).json({ message: "Charity ID is required" });
        }

        const charity = await Charity.findById(charityId);

        if (!charity || !charity.isActive) {
            return res.status(404).json({ message: "Charity not found or inactive" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.preferences = user.preferences || {};
        user.preferences.selectedCharity = charityId;
        await user.save();

        return res.status(200).json({
            message: "Charity selected successfully",
            charity,
            selectedCharity: charityId,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not select charity" });
    }
};

const createCharity = async (req, res) => {
    try {
        const { name, description, category, website } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Charity name is required" });
        }

        const charity = await Charity.create({
            name,
            description: description || "",
            category: category || "General",
            website: website || "",
            createdBy: req.user._id,
        });

        return res.status(201).json({ message: "Charity created successfully", charity });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not create charity" });
    }
};

module.exports = { getCharities, selectCharity, createCharity };
