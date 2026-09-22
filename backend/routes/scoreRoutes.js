const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createScore, updateScore, getUserScores } = require("../controllers/scoreControllers");

const router = express.Router();

router.post("/", protect, createScore);
router.put("/:id", protect, updateScore);
router.get("/user/:userId", protect, getUserScores);

module.exports = router;
