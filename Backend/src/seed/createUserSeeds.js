const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Student = require("../models/Student");
const User = require("../models/User");

const createStudentUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding users...");

        const students = await Student.find();
        console.log(`Found ${students.length} students. Creating user accounts...`);

        for (const student of students) {
            const rollNo = student.rollNo;
            const email = `${rollNo.toLowerCase()}@example.com`; // Dummy email if not present
            const password = `Student${rollNo}`; // Pattern: Student + RollNo

            const existingUser = await User.findOne({ rollNo });
            if (existingUser) {
                console.log(`User for ${rollNo} already exists. Skipping.`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                name: student.name,
                email,
                password: hashedPassword,
                role: "student",
                rollNo
            });

            console.log(`Created user for ${student.name} (${rollNo}) with password: ${password}`);
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding users:", err);
        process.exit(1);
    }
};

createStudentUsers();
