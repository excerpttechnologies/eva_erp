// // models/ProcessPlan.js
// const mongoose = require("mongoose");

// const processPlanSchema = new mongoose.Schema(
//   {
//     planCode: {
//       type: String,
//       unique: true,
//     },
//     planName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     projectType: {
//       type: String,
//       trim: true,
//     },
//     version: {
//       type: String,
//       default: "V1",
//     },
//     priority: {
//       type: String,
//       enum: ["Low", "Medium", "High", "Critical"],
//       default: "Medium",
//     },
//     status: {
//       type: String,
//       enum: ["Draft", "In Progress", "Completed", "On Hold", "Cancelled"],
//       default: "Draft",
//     },
//     description: {
//       type: String,
//       trim: true,
//       default: "",
//     },
//     estimatedHours: {
//       type: Number,
//       default: 0,
//     },
//     actualHours: {
//       type: Number,
//       default: 0,
//     },
//     estimatedCost: {
//       type: Number,
//       default: 0,
//     },
//     actualCost: {
//       type: Number,
//       default: 0,
//     },
//     plannedStartDate: {
//       type: Date,
//     },
//     plannedEndDate: {
//       type: Date,
//     },
//     progress: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },
//     stages: [
//       {
//         sequence: Number,
//         stageName: { type: String, required: true },
//         description: String,
//         department: String,
//         dependsOn: String,
//         plannedStart: Date,
//         plannedEnd: Date,
//         estimatedHours: Number,
//         actualHours: Number,
//         assignedManager: String,
//         progress: { type: Number, default: 0 },
//         status: {
//           type: String,
//           enum: ["Not Started", "In Progress", "Completed", "Blocked"],
//           default: "Not Started",
//         },
       
//         activities: [
//           {
//             activityName: { type: String, required: true },
//             description: String,
//             assignedEmployee: String,
//             priority: {
//               type: String,
//               enum: ["Low", "Medium", "High", "Critical"],
//               default: "Medium",
//             },
//             estimatedHours: Number,
//             actualHours: Number,
//             startDate: Date,
//             endDate: Date,
//             status: {
//               type: String,
//               enum: ["To Do", "In Progress", "Done", "Blocked"],
//               default: "To Do",
//             },
//             remarks: String,
//             // NEW: Checklist items embedded in Activity
//             checklist: [
//               {
//                 title: { type: String, required: true },
//                 description: String,
//                 completed: { type: Boolean, default: false },
//                 completedBy: String,
//                 completedAt: Date,
//               }
//             ]
//           },
//         ],
//       },
//     ],
//     resources: [
//       {
//         resourceType: {
//           type: String,
//           enum: [
//             "Employee",
//             "Vendor",
//             "Machine",
//             "Equipment",
//             "Vehicle",
//             "Other",
//           ],
//         },
//         name: String,
//         quantity: Number,
//         remarks: String,
//       },
//     ],
//     comments: [
//       {
//         user: String,
//         comment: String,
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     history: [
//       {
//         user: String,
//         action: String,
//         oldValue: String,
//         newValue: String,
//         timestamp: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     approvalStatus: {
//       type: String,
//       enum: ["Draft", "Pending Approval", "Approved", "Rejected"],
//       default: "Draft",
//     },
//     submittedBy: String,
//     approvedBy: String,
//     approvalDate: Date,
//     approvalRemarks: String,
//     createdBy: {
//       type: String,
//       required: true,
//     },
//     updatedBy: String,
//     companyId: {
//       type: String,
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     costBreakdown: {
//       materialCost: { type: Number, default: 0 },
//       labourCost: { type: Number, default: 0 },
//       equipmentCost: { type: Number, default: 0 },
//       transportCost: { type: Number, default: 0 },
//       miscellaneousCost: { type: Number, default: 0 },
//       actualMaterialCost: { type: Number, default: 0 },
//       actualLabourCost: { type: Number, default: 0 },
//       actualEquipmentCost: { type: Number, default: 0 },
//       actualTransportCost: { type: Number, default: 0 },
//       actualMiscellaneousCost: { type: Number, default: 0 },
//       estimatedTotal: { type: Number, default: 0 },
//       actualTotal: { type: Number, default: 0 },
//       variance: { type: Number, default: 0 },
//     },
//   },
   
//   {
//     timestamps: true,
//   },
// );

// // Auto-generate planCode before save
// processPlanSchema.pre("save", async function (next) {
//   if (!this.planCode) {
//     const count = await mongoose
//       .model("ProcessPlan")
//       .countDocuments({ companyId: this.companyId });
//     this.planCode = `PP-${String(count + 1).padStart(6, "0")}`;
//   }
//   next();
// });

// // Index for efficient queries
// processPlanSchema.index({ companyId: 1 });
// processPlanSchema.index({ projectId: 1 });
// processPlanSchema.index({ planCode: 1 });

// // Check if model exists before creating
// const ProcessPlan =
//   mongoose.models.ProcessPlan ||
//   mongoose.model("ProcessPlan", processPlanSchema);

// module.exports = ProcessPlan;






///
// models/ProcessPlan.js
const mongoose = require("mongoose");

const processPlanSchema = new mongoose.Schema(
  {
    planCode: {
      type: String,
      unique: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    projectType: {
      type: String,
      trim: true,
    },
    version: {
      type: String,
      default: "V1",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Draft", "In Progress", "Completed", "On Hold", "Cancelled"],
      default: "Draft",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    plannedStartDate: {
      type: Date,
    },
    plannedEndDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    stages: [
      {
        sequence: Number,
        stageName: { type: String, required: true },
        description: String,
        department: String,
        dependsOn: String,
        plannedStart: Date,
        plannedEnd: Date,
        estimatedHours: Number,
        actualHours: Number,
        assignedManager: String,
        progress: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["Not Started", "In Progress", "Completed", "Blocked"],
          default: "Not Started",
        },
       
        activities: [
          {
            activityName: { type: String, required: true },
            description: String,
            assignedEmployee: String,
            priority: {
              type: String,
              enum: ["Low", "Medium", "High", "Critical"],
              default: "Medium",
            },
            estimatedHours: Number,
            actualHours: Number,
            startDate: Date,
            endDate: Date,
            status: {
              type: String,
              enum: ["To Do", "In Progress", "Done", "Blocked"],
              default: "To Do",
            },
            remarks: String,
            // NEW: Checklist items embedded in Activity
            checklist: [
              {
                title: { type: String, required: true },
                description: String,
                completed: { type: Boolean, default: false },
                completedBy: String,
                completedAt: Date,
              }
            ]
          },
        ],
      },
    ],
    resources: [
      {
        resourceType: {
          type: String,
          enum: [
            "Employee",
            "Vendor",
            "Machine",
            "Equipment",
            "Vehicle",
            "Other",
          ],
        },
        name: String,
        quantity: Number,
        remarks: String,
      },
    ],
    comments: [
      {
        user: String,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    history: [
      {
        user: String,
        action: String,
        oldValue: String,
        newValue: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected"],
      default: "Draft",
    },
    submittedBy: String,
    approvedBy: String,
    approvalDate: Date,
    approvalRemarks: String,
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: String,
    companyId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    costBreakdown: {
      materialCost: { type: Number, default: 0 },
      labourCost: { type: Number, default: 0 },
      equipmentCost: { type: Number, default: 0 },
      transportCost: { type: Number, default: 0 },
      miscellaneousCost: { type: Number, default: 0 },
      actualMaterialCost: { type: Number, default: 0 },
      actualLabourCost: { type: Number, default: 0 },
      actualEquipmentCost: { type: Number, default: 0 },
      actualTransportCost: { type: Number, default: 0 },
      actualMiscellaneousCost: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
      actualTotal: { type: Number, default: 0 },
      variance: { type: Number, default: 0 },
    },
  },
   
  {
    timestamps: true,
  },
);

// ==========================================
// AUTO-GENERATE planCode
// ==========================================
processPlanSchema.pre("save", async function (next) {
  if (!this.planCode) {
    const count = await mongoose
      .model("ProcessPlan")
      .countDocuments({ companyId: this.companyId });
    this.planCode = `PP-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// ==========================================
// AUTO-CALCULATE PROGRESS
// ==========================================
processPlanSchema.pre("save", function(next) {
  // Calculate stage progress
  if (this.stages && this.stages.length > 0) {
    this.stages.forEach(stage => {
      if (stage.activities && stage.activities.length > 0) {
        // Count completed activities
        const completed = stage.activities.filter(a => a.status === "Done").length;
        stage.progress = Math.round((completed / stage.activities.length) * 100);
        
        // Update stage status based on progress
        if (stage.progress === 100) {
          stage.status = "Completed";
        } else if (stage.progress > 0) {
          stage.status = "In Progress";
        } else {
          stage.status = "Not Started";
        }
      } else {
        stage.progress = 0;
      }
    });

    // Calculate overall plan progress
    const totalProgress = this.stages.reduce((sum, s) => sum + (s.progress || 0), 0);
    this.progress = Math.round(totalProgress / this.stages.length);
  } else {
    this.progress = 0;
  }

  next();
});

// ==========================================
// INDEXES
// ==========================================
processPlanSchema.index({ companyId: 1 });
processPlanSchema.index({ projectId: 1 });
processPlanSchema.index({ planCode: 1 });

// ==========================================
// MODEL
// ==========================================
const ProcessPlan =
  mongoose.models.ProcessPlan ||
  mongoose.model("ProcessPlan", processPlanSchema);

module.exports = ProcessPlan;