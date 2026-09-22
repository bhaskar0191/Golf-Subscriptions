const Subscription = require("../models/Subscription");
const Payment = require("../models/Payment");
const User = require("../models/User");

const PLAN_PRICING = {
    monthly: { name: "monthly", price: 290, currency: "INR" },
    yearly: { name: "yearly", price: 2880, currency: "INR" },
};

const getPlanConfig = (planName) => {
    const normalized = String(planName || "monthly").toLowerCase();
    return PLAN_PRICING[normalized] || PLAN_PRICING.monthly;
};

const getPlans = async (req, res) => {
    try {
        const plans = Object.values(PLAN_PRICING).map((plan) => ({
            ...plan,
            billingCycle: plan.name,
        }));

        return res.status(200).json({ plans });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not load plans" });
    }
};

const getCurrentSubscription = async (req, res) => {
    try {
        const current = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!current) {
            return res.status(200).json({ subscription: null });
        }

        return res.status(200).json({ subscription: current });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch subscription" });
    }
};

const createSubscription = async (req, res) => {
    try {
        const { planName, billingCycle, paymentStatus } = req.body;
        const selectedPlan = getPlanConfig(planName || billingCycle || "monthly");
        const plan = selectedPlan.name;
        const cycle = (billingCycle || plan).toLowerCase();

        if (!["monthly", "yearly"].includes(plan) && !["monthly", "yearly"].includes(cycle)) {
            return res.status(400).json({ message: "Invalid subscription plan" });
        }

        const invoiceId = `INV-${Date.now()}`;
        const transactionId = `TXN-${Date.now()}`;
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + (cycle === "yearly" ? 12 : 1));

        const subscription = await Subscription.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                planName: plan,
                amount: selectedPlan.price,
                currency: selectedPlan.currency,
                billingCycle: cycle,
                status: paymentStatus === "failed" ? "paused" : "active",
                paymentStatus: paymentStatus || "paid",
                autoRenew: true,
                startDate: now,
                endDate,
                nextBillingDate: endDate,
                lastPaymentAt: paymentStatus === "failed" ? null : now,
                cancelledAt: null,
                metadata: { invoiceId, transactionId },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        const payment = await Payment.create({
            user: req.user._id,
            subscription: subscription._id,
            amount: selectedPlan.price,
            currency: selectedPlan.currency,
            paymentMethod: req.body.paymentMethod || "card",
            provider: req.body.provider || "local",
            status: paymentStatus === "failed" ? "failed" : "paid",
            transactionId,
            invoiceId,
            paidAt: paymentStatus === "failed" ? null : now,
            metadata: { plan, cycle },
        });

        await User.findByIdAndUpdate(req.user._id, {
            subscriptionPlan: plan,
            billingCycle: cycle,
            subscriptionStatus: paymentStatus === "failed" ? "inactive" : "active",
            subscriptionStartDate: now,
            subscriptionEndDate: endDate,
        });

        return res.status(200).json({
            message: "Subscription activated successfully",
            subscription,
            payment,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Subscription activation failed" });
    }
};

const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(404).json({ message: "No active subscription found" });
        }

        subscription.status = "cancelled";
        subscription.autoRenew = false;
        subscription.cancelledAt = new Date();
        subscription.paymentStatus = "refunded";
        await subscription.save();

        await User.findByIdAndUpdate(req.user._id, {
            subscriptionStatus: "inactive",
            subscriptionPlan: "none",
            billingCycle: "monthly",
        });

        return res.status(200).json({ message: "Subscription cancelled successfully", subscription });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not cancel subscription" });
    }
};

const renewSubscription = async (req, res) => {
    try {
        const { planName } = req.body;
        const subscription = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        const selectedPlan = getPlanConfig(planName || subscription.planName);
        const now = new Date();
        const newEndDate = new Date(now);
        newEndDate.setMonth(newEndDate.getMonth() + (subscription.billingCycle === "yearly" ? 12 : 1));

        subscription.planName = selectedPlan.name;
        subscription.amount = selectedPlan.price;
        subscription.billingCycle = subscription.billingCycle || selectedPlan.name;
        subscription.status = "active";
        subscription.autoRenew = true;
        subscription.paymentStatus = "paid";
        subscription.lastPaymentAt = now;
        subscription.startDate = subscription.startDate || now;
        subscription.endDate = newEndDate;
        subscription.nextBillingDate = newEndDate;
        subscription.cancelledAt = null;
        await subscription.save();

        await User.findByIdAndUpdate(req.user._id, {
            subscriptionPlan: selectedPlan.name,
            billingCycle: subscription.billingCycle,
            subscriptionStatus: "active",
            subscriptionEndDate: newEndDate,
        });

        return res.status(200).json({ message: "Subscription renewed successfully", subscription });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not renew subscription" });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ payments });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not fetch payment history" });
    }
};

module.exports = {
    getPlans,
    getCurrentSubscription,
    createSubscription,
    cancelSubscription,
    renewSubscription,
    getPaymentHistory,
};
