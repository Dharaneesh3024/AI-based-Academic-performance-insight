const mongoose = require("mongoose");
const Student = require("../models/Student");
require("dotenv").config();

async function seedStudents() {
  await mongoose.connect(process.env.MONGO_URI);

  await Student.deleteMany();

  await Student.insertMany([
    {
      userId: "65abc123abc123abc123abcd", // dummy ObjectId
      rollNo: "CSE101",
      department: "CSE",
      semester: 5,
      subjects: [
        { name: "Maths", marks: 78, attendance: 90 },
        { name: "Operating Systems", marks: 82, attendance: 85 },
        { name: "DBMS", marks: 75, attendance: 88 },
      ],
    },
    {
      userId: "65abc123abc123abc123abce",
      rollNo: "CSE102",
      department: "CSE",
      semester: 5,
      subjects: [
        { name: "Maths", marks: 88, attendance: 95 },
        { name: "Operating Systems", marks: 90, attendance: 92 },
        { name: "DBMS", marks: 85, attendance: 90 },
      ],
    },
  ]);

  console.log("✅ New dummy students added");
  process.exit();
}

seedStudents();
