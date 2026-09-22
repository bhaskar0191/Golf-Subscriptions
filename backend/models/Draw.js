const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Draw title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        prize: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["draft", "running", "closed", "verified"],
            default: "draft",
        },
        selectionMethod: {
            type: String,
            enum: ["random", "algorithmic"],
            default: "random",
        },
        drawDate: {
            type: Date,
            default: Date.now,
        },
        winnerCount: {
            type: Number,
            default: 1,
            min: 1,
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        winners: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            prize: {
                type: String,
                default: "",
            },
            verified: {
                type: Boolean,
                default: false,
            },
            payoutStatus: {
                type: String,
                enum: ["pending", "approved", "paid"],
                default: "pending",
            },
            proofUrl: {
                type: String,
                default: "",
            },
            announcedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Draw", drawSchema);
