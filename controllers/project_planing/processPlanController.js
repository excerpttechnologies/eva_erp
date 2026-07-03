// controllers/project_planing/processPlanController.js
const ProcessPlan = require("../../models/project_planing/ProcessPlan");
const Project = require("../../models/crm/Project"); // Use the correct path: crm, not crm1

// Helper to get companyId from request
const getCompanyId = (req) => req.headers["companyid"] || req.body.companyId;

// Get Dashboard Stats
exports.getDashboard = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const query = { companyId, isActive: true };

    const [total, draft, pending, approved, running, completed, delayed] =
      await Promise.all([
        ProcessPlan.countDocuments(query),
        ProcessPlan.countDocuments({ ...query, status: "Draft" }),
        ProcessPlan.countDocuments({
          ...query,
          approvalStatus: "Pending Approval",
        }),
        ProcessPlan.countDocuments({ ...query, approvalStatus: "Approved" }),
        ProcessPlan.countDocuments({ ...query, status: "In Progress" }),
        ProcessPlan.countDocuments({ ...query, status: "Completed" }),
        ProcessPlan.countDocuments({
          ...query,
          status: { $ne: "Completed" },
          plannedEndDate: { $lt: new Date() },
        }),
      ]);

    res.json({ total, draft, pending, approved, running, completed, delayed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all plans with filters
exports.getAllPlans = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      search,
      status,
      priority,
      projectId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { companyId, isActive: true };

    if (search) {
      query.$or = [
        { planName: { $regex: search, $options: "i" } },
        { planCode: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.projectId = projectId;
    if (startDate) query.plannedStartDate = { $gte: new Date(startDate) };
    if (endDate) query.plannedEndDate = { $lte: new Date(endDate) };

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProcessPlan.countDocuments(query);
    const plans = await ProcessPlan.find(query)
      .populate("projectId", "projectName clientName status")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      data: plans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single plan
exports.getPlanById = async (req, res) => {
  try {
    const plan = await ProcessPlan.findById(req.params.id).populate(
      "projectId",
      "projectName clientName status",
    );

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create plan
exports.createPlan = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      planName,
      projectId,
      projectType,
      version,
      priority,
      status,
      description,
      estimatedHours,
      estimatedCost,
      plannedStartDate,
      plannedEndDate,
      createdBy,
    } = req.body;

    console.log("Creating plan with data:", req.body);

    if (!planName || !projectId || !createdBy) {
      return res
        .status(400)
        .json({ error: "Plan name, project, and createdBy are required" });
    }

    // Check if project exists using the correct model
    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const plan = new ProcessPlan({
      planName,
      projectId,
      projectType: projectType || "",
      version: version || "V1",
      priority: priority || "Medium",
      status: status || "Draft",
      description: description || "",
      estimatedHours: estimatedHours || 0,
      estimatedCost: estimatedCost || 0,
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      createdBy,
      updatedBy: createdBy,
      companyId,
      stages: [],
      resources: [],
      comments: [],
      history: [
        {
          user: createdBy,
          action: "Created",
          oldValue: "",
          newValue: "Plan created",
        },
      ],
    });

    await plan.save();
    console.log("Plan created successfully:", plan.planCode);
    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update plan
// exports.updatePlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { updatedBy, ...updateData } = req.body;

//     delete updateData.planCode;
//     // delete updateData.createdBy;
//     delete updateData.history;
//     delete updateData.comments;

//     const plan = await ProcessPlan.findById(id);
//     if (!plan) {
//       return res.status(404).json({ error: "Plan not found" });
//     }

//     const changes = [];
//     Object.keys(updateData).forEach((key) => {
//       if (plan[key] !== undefined && plan[key] !== updateData[key]) {
//         changes.push({
//           user: updatedBy || plan.createdBy,
//           action: `Updated ${key}`,
//           oldValue: String(plan[key]),
//           newValue: String(updateData[key]),
//         });
//       }
//     });

//     const updatedPlan = await ProcessPlan.findByIdAndUpdate(
//       id,
//       {
//         ...updateData,
//         updatedBy: updatedBy || plan.createdBy,
//         $push: { history: { $each: changes } },
//       },
//       { new: true, runValidators: true },
//     );

//     res.json(updatedPlan);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };








exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    delete updateData.planCode;
    // delete updateData.createdBy;   // <-- REMOVE THIS LINE so createdBy can be edited
    delete updateData.history;
    delete updateData.comments;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const changes = [];
    Object.keys(updateData).forEach((key) => {
      if (plan[key] !== undefined && plan[key] !== updateData[key]) {
        changes.push({
          user: updatedBy || plan.createdBy,
          action: `Updated ${key}`,
          oldValue: String(plan[key]),
          newValue: String(updateData[key]),
        });
      }
    });

    const updatedPlan = await ProcessPlan.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: updatedBy || plan.createdBy,
        $push: { history: { $each: changes } },
      },
      { new: true, runValidators: true },
    );

    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete plan (soft delete)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await ProcessPlan.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        $push: {
          history: {
            user: req.body.deletedBy || "Admin",
            action: "Deleted",
            oldValue: "Active",
            newValue: "Deleted",
          },
        },
      },
      { new: true },
    );

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Duplicate plan
exports.duplicatePlan = async (req, res) => {
  try {
    const original = await ProcessPlan.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const planData = original.toObject();
    delete planData._id;
    delete planData.planCode;
    delete planData.createdAt;
    delete planData.updatedAt;
    delete planData.history;

    const newPlan = new ProcessPlan({
      ...planData,
      planName: `${planData.planName} (Copy)`,
      status: "Draft",
      approvalStatus: "Draft",
      progress: 0,
      stages: planData.stages.map((stage) => ({
        ...stage,
        progress: 0,
        status: "Not Started",
        activities: stage.activities.map((activity) => ({
          ...activity,
          status: "To Do",
        })),
      })),
      history: [
        {
          user: req.body.createdBy || "Admin",
          action: "Created (Duplicated)",
          oldValue: "",
          newValue: `Duplicated from ${original.planCode}`,
        },
      ],
    });

    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Stage
exports.addStage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stageName,
      description,
      department,
      plannedStart,
      plannedEnd,
      estimatedHours,
      assignedManager,
    } = req.body;

    if (!stageName) {
      return res.status(400).json({ error: "Stage name is required" });
    }

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const sequence =
      plan.stages.length > 0
        ? Math.max(...plan.stages.map((s) => s.sequence)) + 1
        : 1;

    plan.stages.push({
      sequence,
      stageName,
      description: description || "",
      department: department || "",
      plannedStart,
      plannedEnd,
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      assignedManager: assignedManager || "",
      progress: 0,
      status: "Not Started",
      activities: [],
    });

    await plan.save();
    res.status(201).json(plan.stages[plan.stages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Stage
exports.updateStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { ...updateData } = req.body;

    const plan = await ProcessPlan.findOne({ "stages._id": stageId });
    if (!plan) {
      return res.status(404).json({ error: "Stage not found" });
    }

    const stage = plan.stages.id(stageId);
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }

    Object.keys(updateData).forEach((key) => {
      if (key !== "_id" && key !== "activities") {
        stage[key] = updateData[key];
      }
    });

    if (stage.activities && stage.activities.length > 0) {
      const completed = stage.activities.filter(
        (a) => a.status === "Done",
      ).length;
      stage.progress = Math.round((completed / stage.activities.length) * 100);
    }

    await plan.save();
    res.json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Stage
exports.deleteStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const plan = await ProcessPlan.findOne({ "stages._id": stageId });
    if (!plan) {
      return res.status(404).json({ error: "Stage not found" });
    }

    plan.stages.pull(stageId);
    await plan.save();
    res.json({ message: "Stage deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reorder Stages
exports.reorderStages = async (req, res) => {
  try {
    const { stageIds } = req.body;
    if (!stageIds || !Array.isArray(stageIds)) {
      return res.status(400).json({ error: "stageIds array is required" });
    }

    const plan = await ProcessPlan.findOne({ "stages._id": { $in: stageIds } });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    stageIds.forEach((id, index) => {
      const stage = plan.stages.id(id);
      if (stage) {
        stage.sequence = index + 1;
      }
    });

    plan.stages.sort((a, b) => a.sequence - b.sequence);
    await plan.save();
    res.json(plan.stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Activity
exports.addActivity = async (req, res) => {
  try {
    const { stageId } = req.params;
    const {
      activityName,
      description,
      assignedEmployee,
      priority,
      estimatedHours,
      startDate,
      endDate,
    } = req.body;

    if (!activityName) {
      return res.status(400).json({ error: "Activity name is required" });
    }

    const plan = await ProcessPlan.findOne({ "stages._id": stageId });
    if (!plan) {
      return res.status(404).json({ error: "Stage not found" });
    }

    const stage = plan.stages.id(stageId);
    if (!stage) {
      return res.status(404).json({ error: "Stage not found" });
    }

    const activity = {
      activityName,
      description: description || "",
      assignedEmployee: assignedEmployee || "",
      priority: priority || "Medium",
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      startDate,
      endDate,
      status: "To Do",
      remarks: "",
    };

    stage.activities.push(activity);
    await plan.save();
    res.status(201).json(stage.activities[stage.activities.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Activity
exports.updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { ...updateData } = req.body;

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundActivity = null;
    let foundStage = null;

    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundActivity = activity;
        foundStage = stage;
        break;
      }
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        foundActivity[key] = updateData[key];
      }
    });

    const completed = foundStage.activities.filter(
      (a) => a.status === "Done",
    ).length;
    foundStage.progress = Math.round(
      (completed / foundStage.activities.length) * 100,
    );

    const totalStages = plan.stages.length;
    if (totalStages > 0) {
      const totalProgress = plan.stages.reduce(
        (sum, s) => sum + (s.progress || 0),
        0,
      );
      plan.progress = Math.round(totalProgress / totalStages);
    }

    await plan.save();
    res.json(foundActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Activity
exports.deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundStage = null;
    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundStage = stage;
        break;
      }
    }

    if (!foundStage) {
      return res.status(404).json({ error: "Activity not found" });
    }

    foundStage.activities.pull(activityId);
    await plan.save();
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Activity Status
exports.updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundActivity = null;
    let foundStage = null;

    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundActivity = activity;
        foundStage = stage;
        break;
      }
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    foundActivity.status = status;

    const completed = foundStage.activities.filter(
      (a) => a.status === "Done",
    ).length;
    foundStage.progress = Math.round(
      (completed / foundStage.activities.length) * 100,
    );

    const totalStages = plan.stages.length;
    if (totalStages > 0) {
      const totalProgress = plan.stages.reduce(
        (sum, s) => sum + (s.progress || 0),
        0,
      );
      plan.progress = Math.round(totalProgress / totalStages);
    }

    await plan.save();
    res.json(foundActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Resource
exports.addResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { resourceType, name, quantity, remarks } = req.body;

    if (!resourceType || !name) {
      return res
        .status(400)
        .json({ error: "Resource type and name are required" });
    }

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.resources.push({
      resourceType,
      name,
      quantity: quantity || 1,
      remarks: remarks || "",
    });

    await plan.save();
    res.status(201).json(plan.resources[plan.resources.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Resource
exports.deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const plan = await ProcessPlan.findOne({ "resources._id": resourceId });
    if (!plan) {
      return res.status(404).json({ error: "Resource not found" });
    }

    plan.resources.pull(resourceId);
    await plan.save();
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Resource
exports.updateResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { resourceType, name, quantity, remarks, updatedBy } = req.body;

    // Find plan that contains this resource
    const plan = await ProcessPlan.findOne({ "resources._id": resourceId });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Find the specific resource
    const resource = plan.resources.id(resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Store old values for history
    const oldValues = {
      resourceType: resource.resourceType,
      name: resource.name,
      quantity: resource.quantity,
      remarks: resource.remarks,
    };

    // Update fields - only update if provided
    if (resourceType) resource.resourceType = resourceType;
    if (name) resource.name = name;
    if (quantity !== undefined && quantity !== null)
      resource.quantity = parseInt(quantity);
    if (remarks !== undefined) resource.remarks = remarks;

    // Add to history with old and new values
    plan.history.push({
      user: updatedBy || "Admin",
      action: "Updated Resource",
      oldValue: `Type: ${oldValues.resourceType}, Name: ${oldValues.name}, Qty: ${oldValues.quantity}`,
      newValue: `Type: ${resource.resourceType}, Name: ${resource.name}, Qty: ${resource.quantity}`,
    });

    await plan.save();

    res.json({
      success: true,
      message: "Resource updated successfully",
      resource: resource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, comment } = req.body;

    if (!user || !comment) {
      return res.status(400).json({ error: "User and comment are required" });
    }

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.comments.push({ user, comment });
    await plan.save();
    res.status(201).json(plan.comments[plan.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Comments
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.json(plan.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit for Approval
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { submittedBy } = req.body;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.approvalStatus = "Pending Approval";
    plan.submittedBy = submittedBy || plan.createdBy;
    plan.history.push({
      user: submittedBy || plan.createdBy,
      action: "Submitted for Approval",
      oldValue: plan.approvalStatus,
      newValue: "Pending Approval",
    });

    await plan.save();
    res.json({ message: "Plan submitted for approval" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve Plan
exports.approvePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, approvalRemarks } = req.body;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.approvalStatus = "Approved";
    plan.approvedBy = approvedBy || "Admin";
    plan.approvalDate = new Date();
    plan.approvalRemarks = approvalRemarks || "";
    plan.history.push({
      user: approvedBy || "Admin",
      action: "Approved",
      oldValue: "Pending Approval",
      newValue: "Approved",
    });

    await plan.save();
    res.json({ message: "Plan approved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject Plan
exports.rejectPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, rejectionRemarks } = req.body;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.approvalStatus = "Rejected";
    plan.approvalRemarks = rejectionRemarks || "";
    plan.history.push({
      user: rejectedBy || "Admin",
      action: "Rejected",
      oldValue: "Pending Approval",
      newValue: "Rejected",
    });

    await plan.save();
    res.json({ message: "Plan rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate Report
exports.generateReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const { status, projectId, priority, startDate, endDate } = req.query;

    const query = { companyId, isActive: true };
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;
    if (priority) query.priority = priority;
    if (startDate) query.plannedStartDate = { $gte: new Date(startDate) };
    if (endDate) query.plannedEndDate = { $lte: new Date(endDate) };

    const plans = await ProcessPlan.find(query)
      .populate("projectId", "projectName clientName")
      .sort({ createdAt: -1 });

    const summary = {
      total: plans.length,
      totalEstimatedHours: plans.reduce(
        (sum, p) => sum + (p.estimatedHours || 0),
        0,
      ),
      totalActualHours: plans.reduce((sum, p) => sum + (p.actualHours || 0), 0),
      totalEstimatedCost: plans.reduce(
        (sum, p) => sum + (p.estimatedCost || 0),
        0,
      ),
      totalActualCost: plans.reduce((sum, p) => sum + (p.actualCost || 0), 0),
      averageProgress:
        plans.length > 0
          ? Math.round(
              plans.reduce((sum, p) => sum + (p.progress || 0), 0) /
                plans.length,
            )
          : 0,
      byStatus: {},
    };

    plans.forEach((p) => {
      summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
    });

    res.json({
      summary,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Add these new controller functions for Checklist operations

// ==========================================
// ACTIVITY CHECKLIST CONTROLLERS
// ==========================================

/**
 * Add checklist item to an activity
 * POST /api/process/planing/activities/:activityId/checklist
 */
exports.addChecklistItem = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Checklist title is required" });
    }

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundActivity = null;
    let foundStage = null;

    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundActivity = activity;
        foundStage = stage;
        break;
      }
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Add checklist item
    const checklistItem = {
      title,
      description: description || "",
      completed: false,
    };

    foundActivity.checklist = foundActivity.checklist || [];
    foundActivity.checklist.push(checklistItem);

    // Update activity status based on checklist completion
    updateActivityStatusFromChecklist(foundActivity);

    // Update stage progress
    updateStageProgress(foundStage);

    // Update overall plan progress
    updatePlanProgress(plan);

    await plan.save();
    res.status(201).json(foundActivity.checklist[foundActivity.checklist.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update checklist item
 * PUT /api/process/planing/checklist/:checklistId
 */
exports.updateChecklistItem = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { title, description } = req.body;

    const plan = await ProcessPlan.findOne({
      "stages.activities.checklist._id": checklistId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    let foundChecklistItem = null;

    for (const stage of plan.stages) {
      for (const activity of stage.activities) {
        const checklistItem = activity.checklist.id(checklistId);
        if (checklistItem) {
          foundChecklistItem = checklistItem;
          if (title) checklistItem.title = title;
          if (description !== undefined) checklistItem.description = description;
          break;
        }
      }
      if (foundChecklistItem) break;
    }

    if (!foundChecklistItem) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    // Recalculate activity status
    for (const stage of plan.stages) {
      for (const activity of stage.activities) {
        if (activity.checklist && activity.checklist.some(item => item._id.toString() === checklistId)) {
          updateActivityStatusFromChecklist(activity);
          updateStageProgress(stage);
          break;
        }
      }
    }

    updatePlanProgress(plan);
    await plan.save();
    res.json(foundChecklistItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete checklist item
 * DELETE /api/process/planing/checklist/:checklistId
 */
exports.deleteChecklistItem = async (req, res) => {
  try {
    const { checklistId } = req.params;

    const plan = await ProcessPlan.findOne({
      "stages.activities.checklist._id": checklistId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    let foundActivity = null;
    let foundStage = null;

    for (const stage of plan.stages) {
      for (const activity of stage.activities) {
        const checklistItem = activity.checklist.id(checklistId);
        if (checklistItem) {
          foundActivity = activity;
          foundStage = stage;
          break;
        }
      }
      if (foundActivity) break;
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    foundActivity.checklist.pull(checklistId);

    // Recalculate activity status
    updateActivityStatusFromChecklist(foundActivity);
    updateStageProgress(foundStage);
    updatePlanProgress(plan);

    await plan.save();
    res.json({ message: "Checklist item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle checklist item completion
 * PUT /api/process/planing/checklist/:checklistId/toggle
 */
exports.toggleChecklistItem = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { completedBy } = req.body;

    const plan = await ProcessPlan.findOne({
      "stages.activities.checklist._id": checklistId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    let foundActivity = null;
    let foundStage = null;
    let foundChecklistItem = null;

    for (const stage of plan.stages) {
      for (const activity of stage.activities) {
        const checklistItem = activity.checklist.id(checklistId);
        if (checklistItem) {
          foundChecklistItem = checklistItem;
          foundActivity = activity;
          foundStage = stage;
          break;
        }
      }
      if (foundActivity) break;
    }

    if (!foundChecklistItem) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    // Toggle completion status
    foundChecklistItem.completed = !foundChecklistItem.completed;
    if (foundChecklistItem.completed) {
      foundChecklistItem.completedBy = completedBy || "System";
      foundChecklistItem.completedAt = new Date();
    } else {
      foundChecklistItem.completedBy = null;
      foundChecklistItem.completedAt = null;
    }

    // Recalculate activity status based on checklist
    updateActivityStatusFromChecklist(foundActivity);
    updateStageProgress(foundStage);
    updatePlanProgress(plan);

    await plan.save();
    res.json(foundChecklistItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mark all checklist items as complete for an activity
 * PUT /api/process/planing/activities/:activityId/checklist/complete-all
 */
exports.completeAllChecklistItems = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { completedBy } = req.body;

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundActivity = null;
    let foundStage = null;

    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundActivity = activity;
        foundStage = stage;
        break;
      }
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Mark all checklist items as complete
    if (foundActivity.checklist && foundActivity.checklist.length > 0) {
      foundActivity.checklist.forEach(item => {
        item.completed = true;
        item.completedBy = completedBy || "System";
        item.completedAt = new Date();
      });
    }

    // Update activity status to Done
    foundActivity.status = "Done";
    updateStageProgress(foundStage);
    updatePlanProgress(plan);

    await plan.save();
    res.json({ message: "All checklist items completed", activity: foundActivity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// HELPER FUNCTIONS FOR CHECKLIST
// ==========================================

/**
 * Update activity status based on checklist completion
 */
function updateActivityStatusFromChecklist(activity) {
  if (!activity.checklist || activity.checklist.length === 0) {
    return; // No checklist, don't change status
  }

  const allCompleted = activity.checklist.every(item => item.completed === true);
  const anyCompleted = activity.checklist.some(item => item.completed === true);

  if (allCompleted) {
    activity.status = "Done";
  } else if (anyCompleted) {
    if (activity.status === "Done") {
      activity.status = "In Progress";
    }
  }
  // If no items completed, status remains as is
}

/**
 * Update stage progress based on completed activities
 */
function updateStageProgress(stage) {
  if (!stage.activities || stage.activities.length === 0) {
    stage.progress = 0;
    return;
  }

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
}

/**
 * Update overall plan progress
 */
function updatePlanProgress(plan) {
  if (!plan.stages || plan.stages.length === 0) {
    plan.progress = 0;
    return;
  }

  const totalProgress = plan.stages.reduce((sum, s) => sum + (s.progress || 0), 0);
  plan.progress = Math.round(totalProgress / plan.stages.length);
}

// ==========================================
// GET CHECKLIST ITEMS FOR AN ACTIVITY
// ==========================================

/**
 * Get all checklist items for an activity
 * GET /api/process/planing/activities/:activityId/checklist
 */
exports.getChecklistItems = async (req, res) => {
  try {
    const { activityId } = req.params;

    const plan = await ProcessPlan.findOne({
      "stages.activities._id": activityId,
    });
    if (!plan) {
      return res.status(404).json({ error: "Activity not found" });
    }

    let foundActivity = null;
    for (const stage of plan.stages) {
      const activity = stage.activities.id(activityId);
      if (activity) {
        foundActivity = activity;
        break;
      }
    }

    if (!foundActivity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(foundActivity.checklist || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// COST BREAKDOWN - Extexnded ProcessPlan
// ==========================================
// controllers/project_planing/processPlanController.js

// ==========================================
// COST BREAKDOWN CONTROLLERS
// ==========================================

/**
 * Update cost breakdown for a plan
 * PUT /api/process/planing/:id/cost-breakdown
 */
exports.updateCostBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      materialCost,
      labourCost,
      equipmentCost,
      transportCost,
      miscellaneousCost,
      actualMaterialCost,
      actualLabourCost,
      actualEquipmentCost,
      actualTransportCost,
      actualMiscellaneousCost,
      updatedBy,
    } = req.body;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Initialize cost breakdown if not exists
    if (!plan.costBreakdown) {
      plan.costBreakdown = {};
    }

    // Calculate estimated total
    const estimatedTotal = 
      (parseFloat(materialCost) || 0) +
      (parseFloat(labourCost) || 0) +
      (parseFloat(equipmentCost) || 0) +
      (parseFloat(transportCost) || 0) +
      (parseFloat(miscellaneousCost) || 0);

    // Calculate actual total
    const actualTotal = 
      (parseFloat(actualMaterialCost) || 0) +
      (parseFloat(actualLabourCost) || 0) +
      (parseFloat(actualEquipmentCost) || 0) +
      (parseFloat(actualTransportCost) || 0) +
      (parseFloat(actualMiscellaneousCost) || 0);

    // Calculate variance
    const variance = estimatedTotal - actualTotal;

    plan.costBreakdown = {
      materialCost: parseFloat(materialCost) || 0,
      labourCost: parseFloat(labourCost) || 0,
      equipmentCost: parseFloat(equipmentCost) || 0,
      transportCost: parseFloat(transportCost) || 0,
      miscellaneousCost: parseFloat(miscellaneousCost) || 0,
      actualMaterialCost: parseFloat(actualMaterialCost) || 0,
      actualLabourCost: parseFloat(actualLabourCost) || 0,
      actualEquipmentCost: parseFloat(actualEquipmentCost) || 0,
      actualTransportCost: parseFloat(actualTransportCost) || 0,
      actualMiscellaneousCost: parseFloat(actualMiscellaneousCost) || 0,
      estimatedTotal,
      actualTotal,
      variance,
    };

    // Update plan's estimated and actual cost fields for backward compatibility
    plan.estimatedCost = estimatedTotal;
    plan.actualCost = actualTotal;

    // Add to history
    plan.history.push({
      user: updatedBy || "System",
      action: "Updated Cost Breakdown",
      oldValue: "",
      newValue: `Estimated: $${estimatedTotal.toFixed(2)}, Actual: $${actualTotal.toFixed(2)}`,
      timestamp: new Date(),
    });

    await plan.save();
    res.json(plan.costBreakdown);
  } catch (error) {
    console.error("Error updating cost breakdown:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cost breakdown for a plan
 * GET /api/process/planing/:id/cost-breakdown
 */
exports.getCostBreakdown = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan.costBreakdown || {});
  } catch (error) {
    console.error("Error getting cost breakdown:", error);
    res.status(500).json({ error: error.message });
  }
};











// controllers/project_planing/processPlanController.js

/**
 * Recalculate progress for a plan
 * PUT /api/process/planing/:id/recalculate-progress
 */
exports.recalculateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await ProcessPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // Calculate stage progress
    if (plan.stages && plan.stages.length > 0) {
      plan.stages.forEach(stage => {
        if (stage.activities && stage.activities.length > 0) {
          const completed = stage.activities.filter(a => a.status === "Done").length;
          stage.progress = Math.round((completed / stage.activities.length) * 100);
          
          // Update stage status
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
      const totalProgress = plan.stages.reduce((sum, s) => sum + (s.progress || 0), 0);
      plan.progress = Math.round(totalProgress / plan.stages.length);
    } else {
      plan.progress = 0;
    }

    await plan.save();
    res.json({
      success: true,
      message: "Progress recalculated",
      data: {
        progress: plan.progress,
        stages: plan.stages.map(s => ({ name: s.stageName, progress: s.progress, status: s.status }))
      }
    });
  } catch (error) {
    console.error("Error recalculating progress:", error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * Update cost breakdown for a plan
 * PUT /api/process/planing/:id/cost-breakdown
 */
// exports.updateCostBreakdown = async (req, res) => {




//   try {
//     const { id } = req.params;
//     const {
//       materialCost,
//       labourCost,
//       equipmentCost,
//       transportCost,
//       miscellaneousCost,
//       actualMaterialCost,
//       actualLabourCost,
//       actualEquipmentCost,
//       actualTransportCost,
//       actualMiscellaneousCost,
//     } = req.body;

//     const plan = await ProcessPlan.findById(id);
//     if (!plan) {
//       return res.status(404).json({ error: "Plan not found" });
//     }

//     // Initialize cost breakdown if not exists
//     if (!plan.costBreakdown) {
//       plan.costBreakdown = {};
//     }

//     // Calculate estimated total
//     const estimatedTotal = 
//       (parseFloat(materialCost) || 0) +
//       (parseFloat(labourCost) || 0) +
//       (parseFloat(equipmentCost) || 0) +
//       (parseFloat(transportCost) || 0) +
//       (parseFloat(miscellaneousCost) || 0);

//     // Calculate actual total
//     const actualTotal = 
//       (parseFloat(actualMaterialCost) || 0) +
//       (parseFloat(actualLabourCost) || 0) +
//       (parseFloat(actualEquipmentCost) || 0) +
//       (parseFloat(actualTransportCost) || 0) +
//       (parseFloat(actualMiscellaneousCost) || 0);

//     // Calculate variance
//     const variance = estimatedTotal - actualTotal;

//     plan.costBreakdown = {
//       materialCost: parseFloat(materialCost) || 0,
//       labourCost: parseFloat(labourCost) || 0,
//       equipmentCost: parseFloat(equipmentCost) || 0,
//       transportCost: parseFloat(transportCost) || 0,
//       miscellaneousCost: parseFloat(miscellaneousCost) || 0,
//       actualMaterialCost: parseFloat(actualMaterialCost) || 0,
//       actualLabourCost: parseFloat(actualLabourCost) || 0,
//       actualEquipmentCost: parseFloat(actualEquipmentCost) || 0,
//       actualTransportCost: parseFloat(actualTransportCost) || 0,
//       actualMiscellaneousCost: parseFloat(actualMiscellaneousCost) || 0,
//       estimatedTotal,
//       actualTotal,
//       variance,
//     };

//     // Update plan's estimated and actual cost fields for backward compatibility
//     plan.estimatedCost = estimatedTotal;
//     plan.actualCost = actualTotal;

//     // Add to history
//     plan.history.push({
//       user: req.body.updatedBy || "System",
//       action: "Updated Cost Breakdown",
//       oldValue: "",
//       newValue: `Estimated: $${estimatedTotal}, Actual: $${actualTotal}`,
//     });

//     await plan.save();
//     res.json(plan.costBreakdown);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// /**
//  * Get cost breakdown for a plan
//  * GET /api/process/planing/:id/cost-breakdown
//  */
// exports.getCostBreakdown = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const plan = await ProcessPlan.findById(id);
//     if (!plan) {
//       return res.status(404).json({ error: "Plan not found" });
//     }

//     res.json(plan.costBreakdown || {});
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };