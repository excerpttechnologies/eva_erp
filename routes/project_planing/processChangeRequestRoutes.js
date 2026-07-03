// routes/project_planing/processChangeRequestRoutes.js
const express = require("express");
const router = express.Router();
const changeRequestController = require("../../controllers/project_planing/processChangeRequestController");

// ==========================================
// CHANGE REQUEST ROUTES
// ==========================================

// Dashboard and statistics
router.get("/dashboard", changeRequestController.getChangeRequestDashboard || ((req, res) => {
  res.status(500).json({ error: "getChangeRequestDashboard controller not found" });
}));

// Get all change requests with filters
router.get("/", changeRequestController.getAllChangeRequests || ((req, res) => {
  res.status(500).json({ error: "getAllChangeRequests controller not found" });
}));

// Get change requests by plan
router.get("/plan/:planId", changeRequestController.getChangeRequestsByPlan || ((req, res) => {
  res.status(500).json({ error: "getChangeRequestsByPlan controller not found" });
}));

// Get change request by ID
router.get("/:id", changeRequestController.getChangeRequestById || ((req, res) => {
  res.status(500).json({ error: "getChangeRequestById controller not found" });
}));

// Create change request
router.post("/", changeRequestController.createChangeRequest || ((req, res) => {
  res.status(500).json({ error: "createChangeRequest controller not found" });
}));

// Update change request
router.put("/:id", changeRequestController.updateChangeRequest || ((req, res) => {
  res.status(500).json({ error: "updateChangeRequest controller not found" });
}));

// Submit for approval
router.put("/:id/submit", changeRequestController.submitForApproval || ((req, res) => {
  res.status(500).json({ error: "submitForApproval controller not found" });
}));

// Approve change request
router.put("/:id/approve", changeRequestController.approveChangeRequest || ((req, res) => {
  res.status(500).json({ error: "approveChangeRequest controller not found" });
}));

// Reject change request
router.put("/:id/reject", changeRequestController.rejectChangeRequest || ((req, res) => {
  res.status(500).json({ error: "rejectChangeRequest controller not found" });
}));

// Implement change request
router.put("/:id/implement", changeRequestController.implementChangeRequest || ((req, res) => {
  res.status(500).json({ error: "implementChangeRequest controller not found" });
}));

// Close change request
router.put("/:id/close", changeRequestController.closeChangeRequest || ((req, res) => {
  res.status(500).json({ error: "closeChangeRequest controller not found" });
}));

// Delete change request
router.delete("/:id", changeRequestController.deleteChangeRequest || ((req, res) => {
  res.status(500).json({ error: "deleteChangeRequest controller not found" });
}));

module.exports = router;