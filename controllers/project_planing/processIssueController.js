// controllers/project_planing/processIssueController.js
const ProcessIssue = require("../../models/project_planing/ProcessIssue");
const ProcessPlan = require("../../models/project_planing/ProcessPlan");

const getCompanyId = (req) => req.headers["companyid"] || req.body.companyId;

// ==========================================
// ISSUE CRUD OPERATIONS
// ==========================================

/**
 * Create a new issue
 * POST /api/process/issues
 */
exports.createIssue = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      processPlanId,
      title,
      description,
      priority,
      severity,
      assignedTo,
      status,
      dueDate,
      resolution,
      createdBy,
    } = req.body;

    if (!processPlanId || !title || !description) {
      return res.status(400).json({
        error: "Process Plan ID, title, and description are required",
      });
    }

    // Verify plan exists
    const plan = await ProcessPlan.findById(processPlanId);
    if (!plan) {
      return res.status(404).json({ error: "Process plan not found" });
    }

    const issue = new ProcessIssue({
      processPlanId,
      title,
      description,
      priority: priority || "Medium",
      severity: severity || "Major",
      assignedTo: assignedTo || "",
      status: status || "Open",
      dueDate: dueDate || null,
      resolution: resolution || "",
      companyId,
      createdBy: createdBy || "System",
      updatedBy: createdBy || "System",
    });

    await issue.save();

    // Add to plan history
    plan.history.push({
      user: createdBy || "System",
      action: "Issue Created",
      oldValue: "",
      newValue: `Issue: ${title} (${issue.issueCode})`,
    });
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all issues for a plan
 * GET /api/process/issues/plan/:planId
 */
exports.getIssuesByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const companyId = getCompanyId(req);

    const query = { processPlanId: planId, isActive: true };
    if (companyId) query.companyId = companyId;

    const issues = await ProcessIssue.find(query).sort({ createdAt: -1 });

    // Summary statistics
    const summary = {
      total: issues.length,
      open: issues.filter(i => i.status === "Open").length,
      assigned: issues.filter(i => i.status === "Assigned").length,
      inProgress: issues.filter(i => i.status === "In Progress").length,
      onHold: issues.filter(i => i.status === "On Hold").length,
      resolved: issues.filter(i => i.status === "Resolved").length,
      closed: issues.filter(i => i.status === "Closed").length,
      critical: issues.filter(i => i.priority === "Critical").length,
      high: issues.filter(i => i.priority === "High").length,
    };

    res.json({
      data: issues,
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all issues with filters
 * GET /api/process/issues
 */
exports.getAllIssues = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      status,
      priority,
      severity,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { companyId, isActive: true };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (severity) query.severity = severity;
    if (assignedTo) query.assignedTo = { $regex: assignedTo, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { issueCode: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProcessIssue.countDocuments(query);
    const issues = await ProcessIssue.find(query)
      .populate("processPlanId", "planName planCode status")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Dashboard statistics
    const stats = await getIssueStatistics(companyId);

    res.json({
      data: issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get issue by ID
 * GET /api/process/issues/:id
 */
exports.getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await ProcessIssue.findById(id).populate(
      "processPlanId",
      "planName planCode status projectId"
    );

    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update an issue
 * PUT /api/process/issues/:id
 */
exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    const issue = await ProcessIssue.findById(id);
    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Store old values for history
    const oldValues = {
      status: issue.status,
      priority: issue.priority,
      assignedTo: issue.assignedTo,
    };

    // Update the issue
    Object.keys(updateData).forEach(key => {
      if (key !== "_id" && key !== "issueCode" && key !== "companyId") {
        issue[key] = updateData[key];
      }
    });

    issue.updatedBy = updatedBy || issue.createdBy;

    // If status is being changed to Closed, set closedBy and closedDate
    if (updateData.status === "Closed" && oldValues.status !== "Closed") {
      issue.closedBy = updatedBy || issue.createdBy;
      issue.closedDate = new Date();
    }

    // Track status change
    if (updateData.status && updateData.status !== oldValues.status) {
      issue.history = issue.history || [];
      issue.history.push({
        user: updatedBy || issue.createdBy,
        action: "Status Changed",
        oldValue: oldValues.status,
        newValue: updateData.status,
        timestamp: new Date(),
      });
    }

    // Track priority change
    if (updateData.priority && updateData.priority !== oldValues.priority) {
      issue.history = issue.history || [];
      issue.history.push({
        user: updatedBy || issue.createdBy,
        action: "Priority Changed",
        oldValue: oldValues.priority,
        newValue: updateData.priority,
        timestamp: new Date(),
      });
    }

    // Track assignment change
    if (updateData.assignedTo && updateData.assignedTo !== oldValues.assignedTo) {
      issue.history = issue.history || [];
      issue.history.push({
        user: updatedBy || issue.createdBy,
        action: "Assigned To Changed",
        oldValue: oldValues.assignedTo || "Unassigned",
        newValue: updateData.assignedTo,
        timestamp: new Date(),
      });
    }

    await issue.save();

    // Update plan history
    const plan = await ProcessPlan.findById(issue.processPlanId);
    if (plan) {
      plan.history.push({
        user: updatedBy || issue.createdBy,
        action: "Issue Updated",
        oldValue: "",
        newValue: `Issue ${issue.issueCode} updated - ${issue.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Issue updated successfully",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an issue (soft delete)
 * DELETE /api/process/issues/:id
 */
exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy, reason } = req.body;

    const issue = await ProcessIssue.findById(id);
    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.isActive = false;
    issue.history = issue.history || [];
    issue.history.push({
      user: deletedBy || "System",
      action: "Deleted",
      oldValue: issue.status,
      newValue: "Deleted",
      reason: reason || "No reason provided",
      timestamp: new Date(),
    });

    await issue.save();

    // Update plan history
    const plan = await ProcessPlan.findById(issue.processPlanId);
    if (plan) {
      plan.history.push({
        user: deletedBy || "System",
        action: "Issue Deleted",
        oldValue: "",
        newValue: `Issue ${issue.issueCode} deleted: ${issue.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Assign issue to someone
 * PUT /api/process/issues/:id/assign
 */
exports.assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, updatedBy } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ error: "Assigned to is required" });
    }

    const issue = await ProcessIssue.findById(id);
    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    const oldAssignedTo = issue.assignedTo;
    issue.assignedTo = assignedTo;
    issue.status = "Assigned";
    issue.updatedBy = updatedBy || issue.createdBy;

    issue.history = issue.history || [];
    issue.history.push({
      user: updatedBy || issue.createdBy,
      action: "Assigned",
      oldValue: oldAssignedTo || "Unassigned",
      newValue: assignedTo,
      timestamp: new Date(),
    });

    await issue.save();

    res.json({
      success: true,
      message: "Issue assigned successfully",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Resolve an issue
 * PUT /api/process/issues/:id/resolve
 */
exports.resolveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, resolvedBy } = req.body;

    if (!resolution) {
      return res.status(400).json({ error: "Resolution details are required" });
    }

    const issue = await ProcessIssue.findById(id);
    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.resolution = resolution;
    issue.status = "Resolved";
    issue.updatedBy = resolvedBy || issue.createdBy;

    issue.history = issue.history || [];
    issue.history.push({
      user: resolvedBy || issue.createdBy,
      action: "Resolved",
      oldValue: "In Progress",
      newValue: "Resolved",
      timestamp: new Date(),
    });

    await issue.save();

    res.json({
      success: true,
      message: "Issue resolved successfully",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Close an issue
 * PUT /api/process/issues/:id/close
 */
exports.closeIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { closedBy } = req.body;

    const issue = await ProcessIssue.findById(id);
    if (!issue || !issue.isActive) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.status = "Closed";
    issue.closedBy = closedBy || issue.createdBy;
    issue.closedDate = new Date();
    issue.updatedBy = closedBy || issue.createdBy;

    issue.history = issue.history || [];
    issue.history.push({
      user: closedBy || issue.createdBy,
      action: "Closed",
      oldValue: issue.status,
      newValue: "Closed",
      timestamp: new Date(),
    });

    await issue.save();

    res.json({
      success: true,
      message: "Issue closed successfully",
      data: issue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get issue dashboard statistics
 * GET /api/process/issues/dashboard
 */
exports.getIssueDashboard = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const stats = await getIssueStatistics(companyId);

    // Get issues by priority
    const priorityStats = await ProcessIssue.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get issues by severity
    const severityStats = await ProcessIssue.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent issues
    const recentIssues = await ProcessIssue.find({ companyId, isActive: true })
      .populate("processPlanId", "planName planCode")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats,
      priorityStats,
      severityStats,
      recentIssues,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get issue statistics for dashboard
 */
async function getIssueStatistics(companyId) {
  const query = { companyId, isActive: true };

  const [
    total,
    open,
    assigned,
    inProgress,
    onHold,
    resolved,
    closed,
    critical,
    high,
  ] = await Promise.all([
    ProcessIssue.countDocuments(query),
    ProcessIssue.countDocuments({ ...query, status: "Open" }),
    ProcessIssue.countDocuments({ ...query, status: "Assigned" }),
    ProcessIssue.countDocuments({ ...query, status: "In Progress" }),
    ProcessIssue.countDocuments({ ...query, status: "On Hold" }),
    ProcessIssue.countDocuments({ ...query, status: "Resolved" }),
    ProcessIssue.countDocuments({ ...query, status: "Closed" }),
    ProcessIssue.countDocuments({ ...query, priority: "Critical" }),
    ProcessIssue.countDocuments({ ...query, priority: "High" }),
  ]);

  return {
    total,
    open,
    assigned,
    inProgress,
    onHold,
    resolved,
    closed,
    critical,
    high,
    resolutionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
    openPercentage: total > 0 ? Math.round(((open + assigned + inProgress + onHold) / total) * 100) : 0,
  };
}