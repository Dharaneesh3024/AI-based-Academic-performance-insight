const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Unknown Student"
  },
  rollNo: String,
  department: String,
  semester: Number,
  subjects: [
    {
      name: String,
      marks: Number,
      attendance: Number,
    },
  ],
  skills: [
    {
      name: { type: String, required: true },
      level: { type: Number, default: 0 } // 0-100 percentage
    }
  ],
  specialSupport: {
    classes: [
      {
        subject: String,
        dateTime: Date,
        topic: String,
        attendance: { type: String, enum: ["present", "absent", "pending"], default: "pending" }
      }
    ],
    assessments: [
      {
        subject: String,
        topic: String,
        deadline: Date,
        status: { type: String, enum: ["pending", "passed", "failed"], default: "pending" },
        score: Number,
      }
    ]
  }
});
module.exports = mongoose.model("Student", studentSchema);

