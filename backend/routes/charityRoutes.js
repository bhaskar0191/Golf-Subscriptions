const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireSubscriber, requireAdmin } = require("../middleware/roleMiddleware");
const { getCharities, selectCharity, createCharity } = require("../controllers/charityControllers");

const router = express.Router();

router.get("/", getCharities);
router.post("/select", protect, requireSubscriber, selectCharity);
router.post("/", protect, requireAdmin, createCharity);

module.exports = router;
