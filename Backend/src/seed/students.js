const mongoose = require("mongoose");
const Student = require("../models/Student");
require("dotenv").config();

async function seedStudents() {
  await mongoose.connect(process.env.MONGO_URI);

  await Student.deleteMany();

  const names = [
    "Alice Johnson", "Bob Smith", "Charlie Davis", "Diana Prince", "Ethan Hunt",
    "Fiona Apple", "George Miller", "Hannah Montana", "Ian Wright", "Julia Roberts",
    "Kevin Hart", "Laura Palmer", "Mike Tyson", "Nina Simone", "Oscar Wilde",
    "Paula Abdul", "Quentin Tarantino", "Rihanna", "Steve Jobs", "Tina Turner",
    "Uma Thurman", "Victor Hugo", "Wanda Maximoff", "Xavier Woods", "Yara Shahidi",
    "Zinedine Zidane", "Arthur Morgan", "Billie Eilish", "Chris Evans", "David Beckham"
  ];

  const subjectsPool = ["Maths", "OS", "DBMS", "Data Structures", "ML", "Cloud Computing"];
  const skillsPool = ["Python", "React", "Node.js", "C++", "Java", "Communication", "Problem Solving", "Leadership"];

  const students = names.map((name, i) => {
    const rollNo = `CSE${101 + i}`;
    const subjects = subjectsPool.slice(0, 3 + (i % 3)).map(sub => ({
      name: sub,
      marks: Math.floor(Math.random() * (100 - 40 + 1)) + 40,
      attendance: Math.floor(Math.random() * (100 - 60 + 1)) + 60
    }));

    const skills = skillsPool.sort(() => 0.5 - Math.random()).slice(0, 2 + (i % 3)).map(skill => ({
      name: skill,
      level: Math.floor(Math.random() * (100 - 50 + 1)) + 50
    }));

    return {
      name,
      rollNo,
      department: "CSE",
      semester: (i % 8) + 1,
      subjects,
      skills
    };
  });

  await Student.insertMany(students);

  console.log("✅ New dummy students added");
  process.exit();
}

seedStudents();
