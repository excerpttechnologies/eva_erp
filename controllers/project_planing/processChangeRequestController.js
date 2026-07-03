// controllers/project_planing/processChangeRequestController.js
const ProcessChangeRequest = require("../../models/project_planing/ProcessChangeRequest");
const ProcessPlan = require("../../models/project_planing/ProcessPlan");

const getCompanyId = (req) => req.headers["companyid"] || req.body.companyId;

// ==========================================
// CHANGE REQUEST CRUD OPERATIONS
// ==========================================

/**
 * Create a new change request
 * POST /api/process/change-requests
 */
exports.createChangeRequest = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      processPlanId,
      title,
      description,
      reason,
      impact,
      requestedBy,
      approvalStatus,
      remarks,
      createdBy,
    } = req.body;

    if (!processPlanId || !title || !description || !reason || !impact) {
      return res.status(400).json({
        error: "Process Plan ID, title, description, reason, and impact are required",
      });
    }

    // Verify plan exists
    const plan = await ProcessPlan.findById(processPlanId);
    if (!plan) {
      return res.status(404).json({ error: "Process plan not found" });
    }

    const changeRequest = new ProcessChangeRequest({
      processPlanId,
      title,
      description,
      reason,
      impact,
      requestedBy: requestedBy || createdBy || "System",
      requestDate: new Date(),
      approvalStatus: approvalStatus || "Draft",
      remarks: remarks || "",
      companyId,
      createdBy: createdBy || "System",
      updatedBy: createdBy || "System",
    });

    await changeRequest.save();

    // Add to plan history
    plan.history.push({
      user: createdBy || "System",
      action: "Change Request Created",
      oldValue: "",
      newValue: `Change Request: ${title} (${changeRequest.requestCode})`,
    });
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Change request created successfully",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all change requests for a plan
 * GET /api/process/change-requests/plan/:planId
 */
exports.getChangeRequestsByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const companyId = getCompanyId(req);

    const query = { processPlanId: planId, isActive: true };
    if (companyId) query.companyId = companyId;

    const changeRequests = await ProcessChangeRequest.find(query).sort({ createdAt: -1 });

    // Summary statistics
    const summary = {
      total: changeRequests.length,
      draft: changeRequests.filter(c => c.approvalStatus === "Draft").length,
      pending: changeRequests.filter(c => c.approvalStatus === "Pending Approval").length,
      approved: changeRequests.filter(c => c.approvalStatus === "Approved").length,
      rejected: changeRequests.filter(c => c.approvalStatus === "Rejected").length,
      implemented: changeRequests.filter(c => c.approvalStatus === "Implemented").length,
      closed: changeRequests.filter(c => c.approvalStatus === "Closed").length,
    };

    res.json({
      data: changeRequests,
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all change requests with filters
 * GET /api/process/change-requests
 */
exports.getAllChangeRequests = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      approvalStatus,
      requestedBy,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { companyId, isActive: true };

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (requestedBy) query.requestedBy = { $regex: requestedBy, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requestCode: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProcessChangeRequest.countDocuments(query);
    const changeRequests = await ProcessChangeRequest.find(query)
      .populate("processPlanId", "planName planCode status")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Dashboard statistics
    const stats = await getChangeRequestStatistics(companyId);

    res.json({
      data: changeRequests,
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
 * Get change request by ID
 * GET /api/process/change-requests/:id
 */
exports.getChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const changeRequest = await ProcessChangeRequest.findById(id).populate(
      "processPlanId",
      "planName planCode status projectId"
    );

    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    res.json(changeRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a change request
 * PUT /api/process/change-requests/:id
 */
exports.updateChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    // Store old values for history
    const oldStatus = changeRequest.approvalStatus;

    // Update the change request
    Object.keys(updateData).forEach(key => {
      if (key !== "_id" && key !== "requestCode" && key !== "companyId") {
        changeRequest[key] = updateData[key];
      }
    });

    changeRequest.updatedBy = updatedBy || changeRequest.createdBy;

    // Track status change
    if (updateData.approvalStatus && updateData.approvalStatus !== oldStatus) {
      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: updatedBy || changeRequest.createdBy,
        action: "Status Changed",
        oldValue: oldStatus,
        newValue: updateData.approvalStatus,
        timestamp: new Date(),
      });

      // If approved, set approval date
      if (updateData.approvalStatus === "Approved") {
        changeRequest.approvalDate = new Date();
        changeRequest.approvedBy = updatedBy || changeRequest.createdBy;
      }

      // If implemented, set implementation date
      if (updateData.approvalStatus === "Implemented") {
        changeRequest.implementationDate = new Date();
      }
    }

    await changeRequest.save();

    // Update plan history
    const plan = await ProcessPlan.findById(changeRequest.processPlanId);
    if (plan) {
      plan.history.push({
        user: updatedBy || changeRequest.createdBy,
        action: "Change Request Updated",
        oldValue: "",
        newValue: `Change Request ${changeRequest.requestCode} updated - ${changeRequest.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Change request updated successfully",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a change request (soft delete)
 * DELETE /api/process/change-requests/:id
 */
exports.deleteChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy, reason } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    changeRequest.isActive = false;
    changeRequest.history = changeRequest.history || [];
    changeRequest.history.push({
      user: deletedBy || "System",
      action: "Deleted",
      oldValue: changeRequest.approvalStatus,
      newValue: "Deleted",
      reason: reason || "No reason provided",
      timestamp: new Date(),
    });

    await changeRequest.save();

    // Update plan history
    const plan = await ProcessPlan.findById(changeRequest.processPlanId);
    if (plan) {
      plan.history.push({
        user: deletedBy || "System",
        action: "Change Request Deleted",
        oldValue: "",
        newValue: `Change Request ${changeRequest.requestCode} deleted: ${changeRequest.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Change request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit change request for approval
 * PUT /api/process/change-requests/:id/submit
 */
exports.submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { submittedBy } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (changeRequest.approvalStatus === "Draft") {
      changeRequest.approvalStatus = "Pending Approval";
      changeRequest.updatedBy = submittedBy || changeRequest.createdBy;

      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: submittedBy || changeRequest.createdBy,
        action: "Submitted for Approval",
        oldValue: "Draft",
        newValue: "Pending Approval",
        timestamp: new Date(),
      });

      await changeRequest.save();

      // Update plan history
      const plan = await ProcessPlan.findById(changeRequest.processPlanId);
      if (plan) {
        plan.history.push({
          user: submittedBy || changeRequest.createdBy,
          action: "Change Request Submitted",
          oldValue: "",
          newValue: `Change Request ${changeRequest.requestCode} submitted for approval`,
        });
        await plan.save();
      }
    }

    res.json({
      success: true,
      message: "Change request submitted for approval",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve change request
 * PUT /api/process/change-requests/:id/approve
 */
exports.approveChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, remarks } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (changeRequest.approvalStatus === "Pending Approval") {
      changeRequest.approvalStatus = "Approved";
      changeRequest.approvedBy = approvedBy || changeRequest.createdBy;
      changeRequest.approvalDate = new Date();
      changeRequest.updatedBy = approvedBy || changeRequest.createdBy;
      if (remarks) changeRequest.remarks = remarks;

      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: approvedBy || changeRequest.createdBy,
        action: "Approved",
        oldValue: "Pending Approval",
        newValue: "Approved",
        timestamp: new Date(),
      });

      await changeRequest.save();

      // Update plan history
      const plan = await ProcessPlan.findById(changeRequest.processPlanId);
      if (plan) {
        plan.history.push({
          user: approvedBy || changeRequest.createdBy,
          action: "Change Request Approved",
          oldValue: "",
          newValue: `Change Request ${changeRequest.requestCode} approved`,
        });
        await plan.save();
      }
    }

    res.json({
      success: true,
      message: "Change request approved",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject change request
 * PUT /api/process/change-requests/:id/reject
 */
exports.rejectChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, remarks } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (changeRequest.approvalStatus === "Pending Approval") {
      changeRequest.approvalStatus = "Rejected";
      changeRequest.updatedBy = rejectedBy || changeRequest.createdBy;
      if (remarks) changeRequest.remarks = remarks;

      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: rejectedBy || changeRequest.createdBy,
        action: "Rejected",
        oldValue: "Pending Approval",
        newValue: "Rejected",
        reason: remarks || "No reason provided",
        timestamp: new Date(),
      });

      await changeRequest.save();

      // Update plan history
      const plan = await ProcessPlan.findById(changeRequest.processPlanId);
      if (plan) {
        plan.history.push({
          user: rejectedBy || changeRequest.createdBy,
          action: "Change Request Rejected",
          oldValue: "",
          newValue: `Change Request ${changeRequest.requestCode} rejected`,
        });
        await plan.save();
      }
    }

    res.json({
      success: true,
      message: "Change request rejected",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Implement change request
 * PUT /api/process/change-requests/:id/implement
 */
exports.implementChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { implementedBy } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (changeRequest.approvalStatus === "Approved") {
      changeRequest.approvalStatus = "Implemented";
      changeRequest.implementationDate = new Date();
      changeRequest.updatedBy = implementedBy || changeRequest.createdBy;

      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: implementedBy || changeRequest.createdBy,
        action: "Implemented",
        oldValue: "Approved",
        newValue: "Implemented",
        timestamp: new Date(),
      });

      await changeRequest.save();

      // Update plan history
      const plan = await ProcessPlan.findById(changeRequest.processPlanId);
      if (plan) {
        plan.history.push({
          user: implementedBy || changeRequest.createdBy,
          action: "Change Request Implemented",
          oldValue: "",
          newValue: `Change Request ${changeRequest.requestCode} implemented`,
        });
        await plan.save();
      }
    }

    res.json({
      success: true,
      message: "Change request implemented",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Close change request
 * PUT /api/process/change-requests/:id/close
 */
exports.closeChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { closedBy } = req.body;

    const changeRequest = await ProcessChangeRequest.findById(id);
    if (!changeRequest || !changeRequest.isActive) {
      return res.status(404).json({ error: "Change request not found" });
    }

    if (changeRequest.approvalStatus === "Implemented") {
      changeRequest.approvalStatus = "Closed";
      changeRequest.updatedBy = closedBy || changeRequest.createdBy;

      changeRequest.history = changeRequest.history || [];
      changeRequest.history.push({
        user: closedBy || changeRequest.createdBy,
        action: "Closed",
        oldValue: "Implemented",
        newValue: "Closed",
        timestamp: new Date(),
      });

      await changeRequest.save();

      // Update plan history
      const plan = await ProcessPlan.findById(changeRequest.processPlanId);
      if (plan) {
        plan.history.push({
          user: closedBy || changeRequest.createdBy,
          action: "Change Request Closed",
          oldValue: "",
          newValue: `Change Request ${changeRequest.requestCode} closed`,
        });
        await plan.save();
      }
    }

    res.json({
      success: true,
      message: "Change request closed",
      data: changeRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get change request dashboard statistics
 * GET /api/process/change-requests/dashboard
 */
exports.getChangeRequestDashboard = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const stats = await getChangeRequestStatistics(companyId);

    // Recent change requests
    const recentRequests = await ProcessChangeRequest.find({ companyId, isActive: true })
      .populate("processPlanId", "planName planCode")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats,
      recentRequests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get change request statistics for dashboard
 */
async function getChangeRequestStatistics(companyId) {
  const query = { companyId, isActive: true };

  const [
    total,
    draft,
    pending,
    approved,
    rejected,
    implemented,
    closed,
  ] = await Promise.all([
    ProcessChangeRequest.countDocuments(query),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Draft" }),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Pending Approval" }),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Approved" }),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Rejected" }),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Implemented" }),
    ProcessChangeRequest.countDocuments({ ...query, approvalStatus: "Closed" }),
  ]);

  return {
    total,
    draft,
    pending,
    approved,
    rejected,
    implemented,
    closed,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    implementationRate: total > 0 ? Math.round((implemented / total) * 100) : 0,
  };
}