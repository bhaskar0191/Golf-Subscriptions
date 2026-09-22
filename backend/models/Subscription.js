const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        planName: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "INR",
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        status: {
            type: String,
            enum: ["trial", "active", "paused", "cancelled", "expired"],
            default: "active",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        autoRenew: {
            type: Boolean,
            default: true,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            default: null,
        },
        nextBillingDate: {
            type: Date,
            default: null,
        },
        lastPaymentAt: {
            type: Date,
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
