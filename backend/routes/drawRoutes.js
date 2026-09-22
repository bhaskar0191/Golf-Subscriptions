const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireSubscriber, requireAdmin } = require("../middleware/roleMiddleware");
const { joinDraw, createDraw, getDrawResults, verifyWinners, uploadWinnerProof } = require("../controllers/drawControllers");

const router = express.Router();

router.get("/info", (req, res) => {
    res.status(200).json({
        message: "Monthly draws run by selecting eligible participants and awarding winners by a random or algorithmic method.",
        methods: ["random", "algorithmic"],
    });
});
router.post("/join", protect, requireSubscriber, joinDraw);
router.post("/", protect, requireAdmin, createDraw);
router.get("/results", protect, requireSubscriber, getDrawResults);
router.post("/verify", protect, requireAdmin, verifyWinners);
router.post("/proof", protect, requireSubscriber, uploadWinnerProof);

module.exports = router;
