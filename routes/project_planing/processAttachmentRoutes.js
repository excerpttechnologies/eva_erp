// routes/project_planing/processAttachmentRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload");

// Import controller - make sure the path is correct
const attachmentController = require("../../controllers/project_planing/processAttachmentController");

// Check if controller functions exist
if (!attachmentController.uploadAttachment) {
  console.error("ERROR: attachmentController.uploadAttachment is undefined");
  console.log("Available functions:", Object.keys(attachmentController));
}

// Single file upload
router.post(
  "/upload",
  upload.single("file"),
  attachmentController.uploadAttachment || ((req, res) => {
    res.status(500).json({ error: "uploadAttachment controller not found" });
  })
);

// Multiple file upload
router.post(
  "/upload-multiple",
  upload.array("files", 10),
  attachmentController.uploadMultipleAttachments || ((req, res) => {
    res.status(500).json({ error: "uploadMultipleAttachments controller not found" });
  })
);

// Get attachments by plan
router.get("/plan/:planId", attachmentController.getAttachmentsByPlan || ((req, res) => {
  res.status(500).json({ error: "getAttachmentsByPlan controller not found" });
}));

// Get attachments by stage
router.get("/stage/:stageId", attachmentController.getAttachmentsByStage || ((req, res) => {
  res.status(500).json({ error: "getAttachmentsByStage controller not found" });
}));

// Get attachments by activity
router.get("/activity/:activityId", attachmentController.getAttachmentsByActivity || ((req, res) => {
  res.status(500).json({ error: "getAttachmentsByActivity controller not found" });
}));

// Get attachment by ID
router.get("/:id", attachmentController.getAttachmentById || ((req, res) => {
  res.status(500).json({ error: "getAttachmentById controller not found" });
}));
// router.get("/:id/download", attachmentController.downloadAttachment);

// Download attachment
router.get("/:id/download", attachmentController.downloadAttachment || ((req, res) => {
  res.status(500).json({ error: "downloadAttachment controller not found" });
}));

// Delete attachment
router.delete("/:id", attachmentController.deleteAttachment || ((req, res) => {
  res.status(500).json({ error: "deleteAttachment controller not found" });
}));

module.exports = router;