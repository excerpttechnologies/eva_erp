// models/project_planing/ProcessIssue.js
const mongoose = require("mongoose");

const processIssueSchema = new mongoose.Schema(
  {
    processPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan",
      required: true,
    },
    issueCode: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    severity: {
      type: String,
      enum: ["Minor", "Major", "Critical", "Blocker"],
      default: "Major",
    },
    assignedTo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "On Hold", "Resolved", "Closed"],
      default: "Open",
    },
    dueDate: {
      type: Date,
    },
    resolution: {
      type: String,
      trim: true,
    },
    closedBy: {
      type: String,
      trim: true,
    },
    closedDate: {
      type: Date,
    },
    companyId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
    },
    history: [
      {
        user: String,
        action: String,
        oldValue: String,
        newValue: String,
        reason: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate issueCode before save
processIssueSchema.pre("save", async function (next) {
  if (!this.issueCode) {
    const count = await mongoose
      .model("ProcessIssue")
      .countDocuments({ companyId: this.companyId });
    this.issueCode = `ISS-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Indexes for efficient queries
processIssueSchema.index({ companyId: 1 });
processIssueSchema.index({ processPlanId: 1 });
processIssueSchema.index({ status: 1 });
processIssueSchema.index({ priority: 1 });
processIssueSchema.index({ assignedTo: 1 });
processIssueSchema.index({ issueCode: 1 });

const ProcessIssue =
  mongoose.models.ProcessIssue ||
  mongoose.model("ProcessIssue", processIssueSchema);

module.exports = ProcessIssue;