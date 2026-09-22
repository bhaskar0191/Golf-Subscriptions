const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || "golf-secret-key", {
        expiresIn: "7d",
    });
};

const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || "",
            role: "subscriber",
        });

        const token = generateToken(user._id, user.role);

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: user.toPublicJSON(),
        });
    } catch (error) {
        console.error("REGISTER_ERROR:", error);
        return res.status(500).json({ message: error.message || "Registration failed" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id, user.role);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: user.toPublicJSON(),
        });
    } catch (error) {
        console.error("LOGIN_ERROR:", error);
        return res.status(500).json({ message: error.message || "Login failed" });
    }
};

const createAdmin = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can create other admins" });
        }

        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const admin = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || "",
            role: "admin",
        });

        const token = generateToken(admin._id, admin.role);

        return res.status(201).json({
            message: "Admin created successfully",
            token,
            user: admin.toPublicJSON(),
        });
    } catch (error) {
        console.error("ADMIN_CREATE_ERROR:", error);
        return res.status(500).json({ message: error.message || "Admin creation failed" });
    }
};

module.exports = { register, login, createAdmin };
