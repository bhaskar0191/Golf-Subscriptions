require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const charityRoutes = require("./routes/charityRoutes");
const drawRoutes = require("./routes/drawRoutes");
const reportRoutes = require("./routes/reportRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const allowedOrigins = [
  "http://localhost:5173",                // for local dev
];
app.use(cors({
    origin: allowedOrigins, 
    credentials:true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Golf Subscription API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
