// const express = require("express");
// const router = express.Router();
// const processPlanController = require("../../controllers/project_planing/processPlanController");

// // Dashboard
// router.get("/dashboard", processPlanController.getDashboard);

// // Main CRUD
// router.get("/", processPlanController.getAllPlans);
// router.get("/report", processPlanController.generateReport);
// router.get("/:id", processPlanController.getPlanById);
// router.post("/", processPlanController.createPlan);
// router.put("/:id", processPlanController.updatePlan);
// // Cost Breakdown
// router.put(
//   "/:id/cost-breakdown",
//   processPlanController.updateCostBreakdown
// );
// router.delete("/:id", processPlanController.deletePlan);
// router.post("/:id/duplicate", processPlanController.duplicatePlan);

// // Stage operations
// router.post("/:id/stages", processPlanController.addStage);
// router.put("/stages/:stageId", processPlanController.updateStage);
// router.delete("/stages/:stageId", processPlanController.deleteStage);
// router.patch("/stages/reorder", processPlanController.reorderStages);

// // Activity operations
// router.post("/stages/:stageId/activities", processPlanController.addActivity);
// router.put("/activities/:activityId", processPlanController.updateActivity);
// router.delete("/activities/:activityId", processPlanController.deleteActivity);
// router.patch(
//   "/activities/:activityId/status",
//   processPlanController.updateActivityStatus,
// );

// // Resource operations
// router.post("/:id/resources", processPlanController.addResource);
// router.delete("/resources/:resourceId", processPlanController.deleteResource);

// router.put("/resources/:resourceId", processPlanController.updateResource); // ADD THIS

// // Comment operations
// router.post("/:id/comments", processPlanController.addComment);
// router.get("/:id/comments", processPlanController.getComments);

// // Approval operations
// router.post("/:id/submit", processPlanController.submitForApproval);
// router.post("/:id/approve", processPlanController.approvePlan);
// router.post("/:id/reject", processPlanController.rejectPlan);
// // routes/project_planing/processPlanRoutes.js

// // Recalculate progress
// router.put("/:id/recalculate-progress", processPlanController.recalculateProgress);
// module.exports = router;



const express = require("express");
const router = express.Router();
const processPlanController = require("../../controllers/project_planing/processPlanController");

// Dashboard
router.get("/dashboard", processPlanController.getDashboard);

// Main CRUD
router.get("/", processPlanController.getAllPlans);
router.get("/report", processPlanController.generateReport);
router.get("/:id", processPlanController.getPlanById);
router.post("/", processPlanController.createPlan);
router.put("/:id", processPlanController.updatePlan);

// Cost Breakdown
router.put("/:id/cost-breakdown", processPlanController.updateCostBreakdown);
router.get("/:id/cost-breakdown", processPlanController.getCostBreakdown);

router.delete("/:id", processPlanController.deletePlan);
router.post("/:id/duplicate", processPlanController.duplicatePlan);

// Stage operations
router.post("/:id/stages", processPlanController.addStage);
router.put("/stages/:stageId", processPlanController.updateStage);
router.delete("/stages/:stageId", processPlanController.deleteStage);
router.patch("/stages/reorder", processPlanController.reorderStages);

// Activity operations
router.post("/stages/:stageId/activities", processPlanController.addActivity);
router.put("/activities/:activityId", processPlanController.updateActivity);
router.delete("/activities/:activityId", processPlanController.deleteActivity);
router.patch(
  "/activities/:activityId/status",
  processPlanController.updateActivityStatus,
);

// Activity Checklist operations  <-- THESE WERE MISSING, CAUSING THE 404s
router.get(
  "/activities/:activityId/checklist",
  processPlanController.getChecklistItems,
);
router.post(
  "/activities/:activityId/checklist",
  processPlanController.addChecklistItem,
);
router.put(
  "/activities/:activityId/checklist/complete-all",
  processPlanController.completeAllChecklistItems,
);
router.put(
  "/checklist/:checklistId",
  processPlanController.updateChecklistItem,
);
router.put(
  "/checklist/:checklistId/toggle",
  processPlanController.toggleChecklistItem,
);
router.delete(
  "/checklist/:checklistId",
  processPlanController.deleteChecklistItem,
);

// Resource operations
router.post("/:id/resources", processPlanController.addResource);
router.delete("/resources/:resourceId", processPlanController.deleteResource);
router.put("/resources/:resourceId", processPlanController.updateResource);

// Comment operations
router.post("/:id/comments", processPlanController.addComment);
router.get("/:id/comments", processPlanController.getComments);

// Approval operations
router.post("/:id/submit", processPlanController.submitForApproval);
router.post("/:id/approve", processPlanController.approvePlan);
router.post("/:id/reject", processPlanController.rejectPlan);

// Recalculate progress
router.put(
  "/:id/recalculate-progress",
  processPlanController.recalculateProgress,
);

module.exports = router;