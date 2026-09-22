const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
            index: true,
        },
        courseName: {
            type: String,
            required: [true, "Course name is required"],
            trim: true,
        },
        score: {
            type: Number,
            required: [true, "Score is required"],
            min: 0,
        },
        stablefordPoints: {
            type: Number,
            default: null,
            min: 0,
        },
        format: {
            type: String,
            enum: ["stableford", "gross", "net"],
            default: "stableford",
        },
        holes: {
            type: Number,
            default: 18,
            min: 9,
            max: 18,
        },
        roundDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
