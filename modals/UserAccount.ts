import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    teamName: { type: String, required: true, trim: true },
    role: { type: String, default: "member" },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    projectName: { type: String, required: true, trim: true },
    role: { type: String, default:"member" },
    teamName: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    username: { type: String, trim: true, default: "" },
    department: { type: String, enum: ["EEE", "CSE", "AIML", "ECE", "CSBS", "AIDS", "MECH", "IT"], default: null },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profilePicture: { type: String, default: "default.jpg" },
    teams: { type: [teamSchema], default: [] },
    projectsActive: { type: [projectSchema], default: [] },
    projectsCompleted: { type: [projectSchema], default: [] },
    skills: { type: [String], default: [] },
    linkedinUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, default: "" },
    resumeId: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserAccount = mongoose.model("UserAccount", userSchema);

export default UserAccount;
