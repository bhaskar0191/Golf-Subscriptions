const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const { register, login, createAdmin } = require("../controllers/authControllers");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/register", protect, requireAdmin, createAdmin);

module.exports = router;
