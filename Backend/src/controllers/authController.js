const User = require("../models/User");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, rollNo } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNo: rollNo || undefined }]
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or roll number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      rollNo
    });

    // Create Student record if role is student
    if (role === "student") {
      await Student.create({
        name,
        rollNo,
        subjects: [],
        skills: []
      });
    }

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, rollNo, password } = req.body;

    // Support both email and rollNo identifier
    const identifier = email || rollNo;
    console.log("Login attempt for:", identifier);

    const user = await User.findOne({
      $or: [{ email: identifier }, { rollNo: identifier }]
    });

    if (!user) {
      console.log("User not found:", identifier);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", identifier);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      throw new Error("Internal server configuration error");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, rollNo: user.rollNo },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      rollNo: user.rollNo
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
