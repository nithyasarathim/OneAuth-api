const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    username: { type: String, trim: true, default: "" },
    department: {
      type: String,
      enum: ['EEE', 'CSE', 'AIML', 'ECE', 'CSBS', 'AIDS', 'MECH', 'IT'],
      default: null,
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    profilePicture: { type: String, default: 'default.jpg' }, 
    teamIds: { type: [String], default: [] },     
    projectsActive: { type: [String], default: [] }, 
    projectsCompleted: { type: [String], default: [] },
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


const UserAccount = mongoose.model('UserAccount', userSchema);
module.exports = UserAccount;
