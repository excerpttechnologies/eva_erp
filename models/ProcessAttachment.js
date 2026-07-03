const mongoose = require("mongoose");

const processAttachmentSchema = new mongoose.Schema(
  {
    processPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan",
      required: true,
    },
    stageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan.stages",
      required: false,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan.stages.activities",
      required: false,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: String,
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
processAttachmentSchema.index({ processPlanId: 1 });
processAttachmentSchema.index({ stageId: 1 });
processAttachmentSchema.index({ activityId: 1 });
processAttachmentSchema.index({ companyId: 1 });

// Check if model exists before creating
const ProcessAttachment =
  mongoose.models.ProcessAttachment ||
  mongoose.model("ProcessAttachment", processAttachmentSchema);

module.exports = ProcessAttachment;