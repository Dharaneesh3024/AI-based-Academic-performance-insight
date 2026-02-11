const mongoose = require("mongoose");
const Student = require("./src/models/Student");
require("dotenv").config();

const names = [
  "Arjun Kumar",
  "Sneha R",
  "Rahul Singh",
  "Priya Sharma",
  "Vikram Patel",
  "Ananya Das",
  "Karthik M",
  "Divya S",
  "Rohit Verma",
  "Megha N"
];

async function addNames() {
  await mongoose.connect(process.env.MONGO_URI);

  const students = await Student.find();

  for (let i = 0; i < students.length; i++) {
    students[i].name = names[i % names.length] + " " + (i + 1);
    await students[i].save();
  }

  console.log("✅ Real names added successfully");
  process.exit();
}

addNames();
