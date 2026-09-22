const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { getUserReport, getDrawReport, getCharityReport } = require("../controllers/reportControllers");

const router = express.Router();

router.get("/users", protect, requireAdmin, getUserReport);
router.get("/draws", protect, requireAdmin, getDrawReport);
router.get("/charities", protect, requireAdmin, getCharityReport);

module.exports = router;
