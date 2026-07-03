// models/project_planing/ProcessChangeRequest.js
const mongoose = require("mongoose");

const processChangeRequestSchema = new mongoose.Schema(
  {
    processPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan",
      required: true,
    },
    requestCode: {
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    impact: {
      type: String,
      required: true,
      trim: true,
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    approvalStatus: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected", "Implemented", "Closed"],
      default: "Draft",
    },
    approvedBy: {
      type: String,
      trim: true,
    },
    approvalDate: {
      type: Date,
    },
    implementationDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
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

// Auto-generate requestCode before save
processChangeRequestSchema.pre("save", async function (next) {
  if (!this.requestCode) {
    const count = await mongoose
      .model("ProcessChangeRequest")
      .countDocuments({ companyId: this.companyId });
    this.requestCode = `CR-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Indexes for efficient queries
processChangeRequestSchema.index({ companyId: 1 });
processChangeRequestSchema.index({ processPlanId: 1 });
processChangeRequestSchema.index({ approvalStatus: 1 });
processChangeRequestSchema.index({ requestedBy: 1 });
processChangeRequestSchema.index({ requestCode: 1 });

const ProcessChangeRequest =
  mongoose.models.ProcessChangeRequest ||
  mongoose.model("ProcessChangeRequest", processChangeRequestSchema);

module.exports = ProcessChangeRequest;