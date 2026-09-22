const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getProfile, updateProfile, subscribeToPlatform } = require("../controllers/userControllers");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/subscribe", protect, subscribeToPlatform);

module.exports = router;
