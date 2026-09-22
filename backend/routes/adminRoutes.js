const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getAdminDashboard } = require("../controllers/adminControllers");

const router = express.Router();

router.get("/dashboard", protect, requireAdmin, getAdminDashboard);

module.exports = router;
