const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Charity name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            trim: true,
            default: "General",
        },
        website: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Charity", charitySchema);
