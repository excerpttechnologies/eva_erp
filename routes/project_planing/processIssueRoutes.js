// routes/project_planing/processIssueRoutes.js
const express = require("express");
const router = express.Router();
const issueController = require("../../controllers/project_planing/processIssueController");

// ==========================================
// ISSUE ROUTES
// ==========================================

// Dashboard and statistics
router.get("/dashboard", issueController.getIssueDashboard || ((req, res) => {
  res.status(500).json({ error: "getIssueDashboard controller not found" });
}));

// Get all issues with filters
router.get("/", issueController.getAllIssues || ((req, res) => {
  res.status(500).json({ error: "getAllIssues controller not found" });
}));

// Get issues by plan
router.get("/plan/:planId", issueController.getIssuesByPlan || ((req, res) => {
  res.status(500).json({ error: "getIssuesByPlan controller not found" });
}));

// Get issue by ID
router.get("/:id", issueController.getIssueById || ((req, res) => {
  res.status(500).json({ error: "getIssueById controller not found" });
}));

// Create issue
router.post("/", issueController.createIssue || ((req, res) => {
  res.status(500).json({ error: "createIssue controller not found" });
}));

// Update issue
router.put("/:id", issueController.updateIssue || ((req, res) => {
  res.status(500).json({ error: "updateIssue controller not found" });
}));

// Assign issue
router.put("/:id/assign", issueController.assignIssue || ((req, res) => {
  res.status(500).json({ error: "assignIssue controller not found" });
}));

// Resolve issue
router.put("/:id/resolve", issueController.resolveIssue || ((req, res) => {
  res.status(500).json({ error: "resolveIssue controller not found" });
}));

// Close issue
router.put("/:id/close", issueController.closeIssue || ((req, res) => {
  res.status(500).json({ error: "closeIssue controller not found" });
}));

// Delete issue
router.delete("/:id", issueController.deleteIssue || ((req, res) => {
  res.status(500).json({ error: "deleteIssue controller not found" });
}));

module.exports = router;