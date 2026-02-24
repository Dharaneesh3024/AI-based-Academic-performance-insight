const User = require("../models/User");
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

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, rollNo, password } = req.body;

    // Support both email and rollNo identifier
    const identifier = email || rollNo;
    const user = await User.findOne({
      $or: [{ email: identifier }, { rollNo: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
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
    res.status(500).json({ message: "Login failed" });
  }
};
