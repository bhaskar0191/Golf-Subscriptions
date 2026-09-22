const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireSubscriber } = require("../middleware/roleMiddleware");
const {
    getPlans,
    getCurrentSubscription,
    createSubscription,
    cancelSubscription,
    renewSubscription,
    getPaymentHistory,
} = require("../controllers/subscriptionControllers");

const router = express.Router();

router.get("/plans", getPlans);
router.get("/me", protect, requireSubscriber, getCurrentSubscription);
router.post("/checkout", protect, requireSubscriber, createSubscription);
router.post("/cancel", protect, requireSubscriber, cancelSubscription);
router.post("/renew", protect, requireSubscriber, renewSubscription);
router.get("/payments", protect, requireSubscriber, getPaymentHistory);

module.exports = router;
