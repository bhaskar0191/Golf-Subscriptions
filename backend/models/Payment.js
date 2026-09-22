const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: "USD",
        },
        paymentMethod: {
            type: String,
            default: "card",
        },
        provider: {
            type: String,
            default: "local",
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        transactionId: {
            type: String,
            default: "",
        },
        invoiceId: {
            type: String,
            default: "",
        },
        paidAt: {
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

module.exports = mongoose.model("Payment", paymentSchema);
