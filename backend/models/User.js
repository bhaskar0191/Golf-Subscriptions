const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        role: {
            type: String,
            enum: ["subscriber", "admin"],
            default: "subscriber",
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        subscriptionPlan: {
            type: String,
            enum: ["monthly", "yearly", "none"],
            default: "none",
        },
        billingCycle: {
            type: String,
            enum: ["monthly", "yearly"],
            default: "monthly",
        },
        subscriptionStatus: {
            type: String,
            enum: ["active", "inactive", "trial"],
            default: "inactive",
        },
        subscriptionStartDate: {
            type: Date,
            default: null,
        },
        subscriptionEndDate: {
            type: Date,
            default: null,
        },
        preferences: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model("User", userSchema);
