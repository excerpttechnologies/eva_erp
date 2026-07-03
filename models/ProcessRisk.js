// models/ProcessRisk.js (Updated with history tracking)
const mongoose = require("mongoose");

const processRiskSchema = new mongoose.Schema(
  {
    processPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessPlan",
      required: true,
    },
    riskCode: {
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
    category: {
      type: String,
      enum: [
        "Technical",
        "Operational",
        "Financial",
        "Schedule",
        "Resource",
        "Quality",
        "Compliance",
        "External",
        "Other",
      ],
      default: "Operational",
    },
    probability: {
      type: String,
      enum: ["Very Low", "Low", "Medium", "High", "Very High"],
      default: "Medium",
    },
    impact: {
      type: String,
      enum: ["Very Low", "Low", "Medium", "High", "Very High"],
      default: "Medium",
    },
    severity: {
      type: String,
      enum: ["Very Low", "Low", "Medium", "High", "Very High", "Critical"],
      default: "Medium",
    },
    owner: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "Under Review", "Mitigated", "Closed"],
      default: "Open",
    },
    dueDate: {
      type: Date,
    },
    mitigationPlan: {
      type: String,
      trim: true,
    },
    resolution: {
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

// Auto-generate riskCode before save
processRiskSchema.pre("save", async function (next) {
  if (!this.riskCode) {
    const count = await mongoose
      .model("ProcessRisk")
      .countDocuments({ companyId: this.companyId });
    this.riskCode = `RISK-${String(count + 1).padStart(6, "0")}`;
  }
  
  // Auto-calculate severity if not provided
  if (!this.severity || this.isNew) {
    const probabilityScore = getProbabilityScore(this.probability);
    const impactScore = getImpactScore(this.impact);
    this.severity = calculateSeverity(probabilityScore, impactScore);
  }
  
  next();
});

// Helper functions for severity calculation
function getProbabilityScore(probability) {
  const scores = {
    "Very Low": 1,
    "Low": 2,
    "Medium": 3,
    "High": 4,
    "Very High": 5,
  };
  return scores[probability] || 3;
}

function getImpactScore(impact) {
  const scores = {
    "Very Low": 1,
    "Low": 2,
    "Medium": 3,
    "High": 4,
    "Very High": 5,
  };
  return scores[impact] || 3;
}

function calculateSeverity(probabilityScore, impactScore) {
  const riskScore = probabilityScore * impactScore;
  
  if (riskScore >= 20) return "Critical";
  if (riskScore >= 15) return "High";
  if (riskScore >= 9) return "Medium";
  if (riskScore >= 4) return "Low";
  return "Very Low";
}

// Indexes for efficient queries
processRiskSchema.index({ companyId: 1 });
processRiskSchema.index({ processPlanId: 1 });
processRiskSchema.index({ status: 1 });
processRiskSchema.index({ severity: 1 });
processRiskSchema.index({ riskCode: 1 });

const ProcessRisk =
  mongoose.models.ProcessRisk ||
  mongoose.model("ProcessRisk", processRiskSchema);

module.exports = ProcessRisk;