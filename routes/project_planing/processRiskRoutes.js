// // routes/project_planing/processRiskRoutes.js
const express = require("express");
const router = express.Router();
const riskController = require("../../controllers/project_planing/processRiskController");

// ==========================================
// RISK ROUTES
// ==========================================

// Dashboard and statistics
router.get("/dashboard", riskController.getRiskDashboard || ((req, res) => {
  res.status(500).json({ error: "getRiskDashboard controller not found" });
}));

// Get all risks with filters
router.get("/", riskController.getAllRisks || ((req, res) => {
  res.status(500).json({ error: "getAllRisks controller not found" });
}));

// Get risks by status
router.get("/status/:status", riskController.getRisksByStatus || ((req, res) => {
  res.status(500).json({ error: "getRisksByStatus controller not found" });
}));

// Get risk by risk code
router.get("/code/:riskCode", riskController.getRiskByCode || ((req, res) => {
  res.status(500).json({ error: "getRiskByCode controller not found" });
}));

// Get risks by plan
router.get("/plan/:planId", riskController.getRisksByPlan || ((req, res) => {
  res.status(500).json({ error: "getRisksByPlan controller not found" });
}));

// Get risk by ID
router.get("/:id", riskController.getRiskById || ((req, res) => {
  res.status(500).json({ error: "getRiskById controller not found" });
}));

// Create risk
router.post("/", riskController.createRisk || ((req, res) => {
  res.status(500).json({ error: "createRisk controller not found" });
}));

// Update risk
router.put("/:id", riskController.updateRisk || ((req, res) => {
  res.status(500).json({ error: "updateRisk controller not found" });
}));

// Add mitigation plan
router.put("/:id/mitigation", riskController.addMitigationPlan || ((req, res) => {
  res.status(500).json({ error: "addMitigationPlan controller not found" });
}));

// Resolve risk
router.put("/:id/resolve", riskController.resolveRisk || ((req, res) => {
  res.status(500).json({ error: "resolveRisk controller not found" });
}));

// Bulk update status
router.put("/bulk-status", riskController.bulkUpdateStatus || ((req, res) => {
  res.status(500).json({ error: "bulkUpdateStatus controller not found" });
}));

// Delete risk
router.delete("/:id", riskController.deleteRisk || ((req, res) => {
  res.status(500).json({ error: "deleteRisk controller not found" });
}));

module.exports = router;