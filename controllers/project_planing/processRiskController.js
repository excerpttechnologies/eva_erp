// controllers/project_planing/processRiskController.js
const ProcessRisk = require("../../models/ProcessRisk");
const ProcessPlan = require("../../models/project_planing/ProcessPlan");

const getCompanyId = (req) => req.headers["companyid"] || req.body.companyId;

// ==========================================
// RISK CRUD OPERATIONS
// ==========================================

/**
 * Create a new risk
 * POST /api/process/risks
 */
exports.createRisk = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      processPlanId,
      title,
      description,
      category,
      probability,
      impact,
      severity,
      owner,
      status,
      dueDate,
      mitigationPlan,
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

    // Calculate severity if not provided
    let calculatedSeverity = severity;
    if (!calculatedSeverity) {
      const probabilityScore = getProbabilityScore(probability || "Medium");
      const impactScore = getImpactScore(impact || "Medium");
      calculatedSeverity = calculateSeverity(probabilityScore, impactScore);
    }

    const risk = new ProcessRisk({
      processPlanId,
      title,
      description,
      category: category || "Operational",
      probability: probability || "Medium",
      impact: impact || "Medium",
      severity: calculatedSeverity,
      owner: owner || "",
      status: status || "Open",
      dueDate: dueDate || null,
      mitigationPlan: mitigationPlan || "",
      resolution: resolution || "",
      companyId,
      createdBy: createdBy || "System",
      updatedBy: createdBy || "System",
    });

    await risk.save();

    // Add to plan history
    plan.history.push({
      user: createdBy || "System",
      action: "Risk Created",
      oldValue: "",
      newValue: `Risk: ${title} (${risk.riskCode}) - Severity: ${calculatedSeverity}`,
    });
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Risk created successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all risks for a plan
 * GET /api/process/risks/plan/:planId
 */
exports.getRisksByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const companyId = getCompanyId(req);

    const query = { processPlanId: planId, isActive: true };
    if (companyId) query.companyId = companyId;

    const risks = await ProcessRisk.find(query).sort({ createdAt: -1 });

    // Add summary statistics
    const summary = {
      total: risks.length,
      open: risks.filter(r => r.status === "Open").length,
      underReview: risks.filter(r => r.status === "Under Review").length,
      mitigated: risks.filter(r => r.status === "Mitigated").length,
      closed: risks.filter(r => r.status === "Closed").length,
      critical: risks.filter(r => r.severity === "Critical").length,
      high: risks.filter(r => r.severity === "High").length,
    };

    res.json({
      data: risks,
      summary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all risks (with filters and pagination)
 * GET /api/process/risks
 */
exports.getAllRisks = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const {
      status,
      severity,
      category,
      probability,
      impact,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { companyId, isActive: true };

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (category) query.category = category;
    if (probability) query.probability = probability;
    if (impact) query.impact = impact;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { riskCode: { $regex: search, $options: "i" } },
        { owner: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProcessRisk.countDocuments(query);
    const risks = await ProcessRisk.find(query)
      .populate("processPlanId", "planName planCode status")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Dashboard statistics
    const stats = await getRiskStatistics(companyId);

    res.json({
      data: risks,
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
 * Get risk by ID
 * GET /api/process/risks/:id
 */
exports.getRiskById = async (req, res) => {
  try {
    const { id } = req.params;

    const risk = await ProcessRisk.findById(id).populate(
      "processPlanId",
      "planName planCode status projectId"
    );

    if (!risk || !risk.isActive) {
      return res.status(404).json({ error: "Risk not found" });
    }

    res.json(risk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a risk
 * PUT /api/process/risks/:id
 */
exports.updateRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updateData } = req.body;

    const risk = await ProcessRisk.findById(id);
    if (!risk || !risk.isActive) {
      return res.status(404).json({ error: "Risk not found" });
    }

    // Store old values for history
    const oldValues = {
      status: risk.status,
      severity: risk.severity,
      owner: risk.owner,
    };

    // Calculate severity if probability or impact is being updated
    if (updateData.probability || updateData.impact) {
      const probability = updateData.probability || risk.probability;
      const impact = updateData.impact || risk.impact;
      const probabilityScore = getProbabilityScore(probability);
      const impactScore = getImpactScore(impact);
      updateData.severity = calculateSeverity(probabilityScore, impactScore);
    }

    // Update the risk
    Object.keys(updateData).forEach(key => {
      if (key !== "_id" && key !== "riskCode" && key !== "companyId") {
        risk[key] = updateData[key];
      }
    });

    risk.updatedBy = updatedBy || risk.createdBy;

    // Track status change in history (if applicable)
    if (updateData.status && updateData.status !== oldValues.status) {
      risk.history = risk.history || [];
      risk.history.push({
        user: updatedBy || risk.createdBy,
        action: "Status Changed",
        oldValue: oldValues.status,
        newValue: updateData.status,
        timestamp: new Date(),
      });
    }

    // Track severity change
    if (risk.severity !== oldValues.severity) {
      risk.history = risk.history || [];
      risk.history.push({
        user: updatedBy || risk.createdBy,
        action: "Severity Changed",
        oldValue: oldValues.severity,
        newValue: risk.severity,
        timestamp: new Date(),
      });
    }

    await risk.save();

    // Update plan history
    const plan = await ProcessPlan.findById(risk.processPlanId);
    if (plan) {
      plan.history.push({
        user: updatedBy || risk.createdBy,
        action: "Risk Updated",
        oldValue: "",
        newValue: `Risk ${risk.riskCode} updated - ${risk.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Risk updated successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a risk (soft delete)
 * DELETE /api/process/risks/:id
 */
exports.deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const { deletedBy, reason } = req.body;

    const risk = await ProcessRisk.findById(id);
    if (!risk || !risk.isActive) {
      return res.status(404).json({ error: "Risk not found" });
    }

    risk.isActive = false;
    risk.history = risk.history || [];
    risk.history.push({
      user: deletedBy || "System",
      action: "Deleted",
      oldValue: risk.status,
      newValue: "Deleted",
      reason: reason || "No reason provided",
      timestamp: new Date(),
    });

    await risk.save();

    // Update plan history
    const plan = await ProcessPlan.findById(risk.processPlanId);
    if (plan) {
      plan.history.push({
        user: deletedBy || "System",
        action: "Risk Deleted",
        oldValue: "",
        newValue: `Risk ${risk.riskCode} deleted: ${risk.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Risk deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk update risk status
 * PUT /api/process/risks/bulk-status
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { riskIds, status, updatedBy } = req.body;

    if (!riskIds || !Array.isArray(riskIds) || riskIds.length === 0) {
      return res.status(400).json({ error: "Risk IDs array is required" });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["Open", "Under Review", "Mitigated", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await ProcessRisk.updateMany(
      { _id: { $in: riskIds }, isActive: true },
      {
        status,
        updatedBy: updatedBy || "System",
        history: {
          $push: {
            user: updatedBy || "System",
            action: "Bulk Status Update",
            oldValue: "Previous",
            newValue: status,
            timestamp: new Date(),
          },
        },
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} risk(s) updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get risk dashboard statistics
 * GET /api/process/risks/dashboard
 */
exports.getRiskDashboard = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const stats = await getRiskStatistics(companyId);

    // Get risks by category
    const categoryStats = await ProcessRisk.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get risks by severity
    const severityStats = await ProcessRisk.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get risks by probability
    const probabilityStats = await ProcessRisk.aggregate([
      { $match: { companyId, isActive: true } },
      { $group: { _id: "$probability", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent risks
    const recentRisks = await ProcessRisk.find({ companyId, isActive: true })
      .populate("processPlanId", "planName planCode")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats,
      categoryStats,
      severityStats,
      probabilityStats,
      recentRisks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get score for probability level
 */
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

/**
 * Get score for impact level
 */
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

/**
 * Calculate severity based on probability and impact scores
 */
function calculateSeverity(probabilityScore, impactScore) {
  const riskScore = probabilityScore * impactScore;
  
  if (riskScore >= 20) return "Critical";
  if (riskScore >= 15) return "High";
  if (riskScore >= 9) return "Medium";
  if (riskScore >= 4) return "Low";
  return "Very Low";
}

/**
 * Get risk statistics for dashboard
 */
async function getRiskStatistics(companyId) {
  const query = { companyId, isActive: true };

  const [
    total,
    open,
    underReview,
    mitigated,
    closed,
    critical,
    high,
    medium,
    low,
  ] = await Promise.all([
    ProcessRisk.countDocuments(query),
    ProcessRisk.countDocuments({ ...query, status: "Open" }),
    ProcessRisk.countDocuments({ ...query, status: "Under Review" }),
    ProcessRisk.countDocuments({ ...query, status: "Mitigated" }),
    ProcessRisk.countDocuments({ ...query, status: "Closed" }),
    ProcessRisk.countDocuments({ ...query, severity: "Critical" }),
    ProcessRisk.countDocuments({ ...query, severity: "High" }),
    ProcessRisk.countDocuments({ ...query, severity: "Medium" }),
    ProcessRisk.countDocuments({ ...query, severity: "Low" }),
  ]);

  return {
    total,
    open,
    underReview,
    mitigated,
    closed,
    critical,
    high,
    medium,
    low,
    closureRate: total > 0 ? Math.round((closed / total) * 100) : 0,
    openPercentage: total > 0 ? Math.round((open / total) * 100) : 0,
  };
}

/**
 * Get risk by risk code
 * GET /api/process/risks/code/:riskCode
 */
exports.getRiskByCode = async (req, res) => {
  try {
    const { riskCode } = req.params;
    const companyId = getCompanyId(req);

    const query = { riskCode, isActive: true };
    if (companyId) query.companyId = companyId;

    const risk = await ProcessRisk.findOne(query).populate(
      "processPlanId",
      "planName planCode"
    );

    if (!risk) {
      return res.status(404).json({ error: "Risk not found" });
    }

    res.json(risk);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Add mitigation plan to a risk
 * PUT /api/process/risks/:id/mitigation
 */
exports.addMitigationPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { mitigationPlan, updatedBy } = req.body;

    if (!mitigationPlan) {
      return res.status(400).json({ error: "Mitigation plan is required" });
    }

    const risk = await ProcessRisk.findById(id);
    if (!risk || !risk.isActive) {
      return res.status(404).json({ error: "Risk not found" });
    }

    risk.mitigationPlan = mitigationPlan;
    risk.updatedBy = updatedBy || risk.createdBy;
    risk.status = "Under Review";

    risk.history = risk.history || [];
    risk.history.push({
      user: updatedBy || risk.createdBy,
      action: "Mitigation Plan Added",
      oldValue: "",
      newValue: "Mitigation plan added",
      timestamp: new Date(),
    });

    await risk.save();

    // Update plan history
    const plan = await ProcessPlan.findById(risk.processPlanId);
    if (plan) {
      plan.history.push({
        user: updatedBy || risk.createdBy,
        action: "Risk Mitigation Added",
        oldValue: "",
        newValue: `Mitigation plan added for ${risk.riskCode}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Mitigation plan added successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Resolve a risk
 * PUT /api/process/risks/:id/resolve
 */
exports.resolveRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, resolvedBy } = req.body;

    if (!resolution) {
      return res.status(400).json({ error: "Resolution details are required" });
    }

    const risk = await ProcessRisk.findById(id);
    if (!risk || !risk.isActive) {
      return res.status(404).json({ error: "Risk not found" });
    }

    risk.resolution = resolution;
    risk.status = "Closed";
    risk.updatedBy = resolvedBy || risk.createdBy;

    risk.history = risk.history || [];
    risk.history.push({
      user: resolvedBy || risk.createdBy,
      action: "Risk Resolved",
      oldValue: risk.status,
      newValue: "Closed",
      timestamp: new Date(),
    });

    await risk.save();

    // Update plan history
    const plan = await ProcessPlan.findById(risk.processPlanId);
    if (plan) {
      plan.history.push({
        user: resolvedBy || risk.createdBy,
        action: "Risk Resolved",
        oldValue: "",
        newValue: `Risk ${risk.riskCode} resolved: ${risk.title}`,
      });
      await plan.save();
    }

    res.json({
      success: true,
      message: "Risk resolved successfully",
      data: risk,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get risks by status
 * GET /api/process/risks/status/:status
 */
exports.getRisksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const companyId = getCompanyId(req);

    const validStatuses = ["Open", "Under Review", "Mitigated", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const query = { status, isActive: true };
    if (companyId) query.companyId = companyId;

    const risks = await ProcessRisk.find(query)
      .populate("processPlanId", "planName planCode")
      .sort({ createdAt: -1 });

    res.json(risks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};