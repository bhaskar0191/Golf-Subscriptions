const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    return next();
};

const requireSubscriber = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "subscriber") {
        return res.status(403).json({ message: "Access denied. Subscriber access required." });
    }

    return next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }

    return next();
};

const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const jwt = require("jsonwebtoken");
        const User = require("../models/User");

        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "golf-secret-key");
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            req.user = null;
        }
    }

    return next();
};

module.exports = {
    requireAuth,
    requireSubscriber,
    requireAdmin,
    optionalAuth,
};
