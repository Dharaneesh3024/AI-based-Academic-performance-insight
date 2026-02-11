const mongoose=require("mongoose");
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
});
module.exports = mongoose.model("Student", studentSchema);

