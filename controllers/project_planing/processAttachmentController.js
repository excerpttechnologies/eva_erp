const ProcessAttachment = require("../../models/ProcessAttachment");
const ProcessPlan = require("../../models/project_planing/ProcessPlan");
const path = require("path");
const fs = require("fs");

// Helper to get companyId from request
const getCompanyId = (req) => req.headers["companyid"] || req.body.companyId;

// Supported file types
const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];

/**
 * Upload a file attachment
 * POST /api/process/attachments/upload
 */
// exports.uploadAttachment = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     if (!companyId) {
//       return res.status(400).json({ error: "Company ID is required" });
//     }

//     const { processPlanId, stageId, activityId } = req.body;
//     const uploadedBy = req.body.uploadedBy || "System";

//     if (!processPlanId) {
//       return res.status(400).json({ error: "Process Plan ID is required" });
//     }

//     // Verify process plan exists
//     const plan = await ProcessPlan.findById(processPlanId);
//     if (!plan) {
//       return res.status(404).json({ error: "Process plan not found" });
//     }

//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Validate file type
//     if (!SUPPORTED_FILE_TYPES.includes(req.file.mimetype)) {
//       // Remove uploaded file
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error("Error deleting unsupported file:", err);
//       });
//       return res.status(400).json({
//         error:
//           "Unsupported file type. Supported types: Images, PDF, DOC, DOCX, XLS, XLSX, ZIP",
//       });
//     }

//     // Create attachment record
//     const attachment = new ProcessAttachment({
//       processPlanId,
//       stageId: stageId || null,
//       activityId: activityId || null,
//       fileName: req.file.filename,
//       originalName: req.file.originalname,
//       fileUrl: `/uploads/process/${req.file.filename}`,
//       fileSize: req.file.size,
//       fileType: req.file.mimetype,
//       uploadedBy,
//       companyId,
//       uploadedAt: new Date(),
//     });

//     await attachment.save();

//     // Add to plan history
//     plan.history.push({
//       user: uploadedBy,
//       action: "File Uploaded",
//       oldValue: "",
//       newValue: `Uploaded: ${req.file.originalname}`,
//     });

//     await plan.save();

//     res.status(201).json({
//       success: true,
//       message: "File uploaded successfully",
//       data: attachment,
//     });
//   } catch (error) {
//     // Clean up uploaded file if error occurs
//     if (req.file && req.file.path) {
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error("Error deleting file on error:", err);
//       });
//     }
//     res.status(500).json({ error: error.message });
//   }
// };
/**
 * Upload a file attachment
 * POST /api/process/attachments/upload
 */
exports.uploadAttachment = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    if (!companyId) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    const { processPlanId, stageId, activityId } = req.body;
    const uploadedBy = req.body.uploadedBy || "System";

    if (!processPlanId) {
      return res.status(400).json({ error: "Process Plan ID is required" });
    }

    // Verify process plan exists
    const plan = await ProcessPlan.findById(processPlanId);
    if (!plan) {
      return res.status(404).json({ error: "Process plan not found" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File uploaded:", req.file);
    console.log("File path:", req.file.path);

    // Create attachment record with correct path
    const attachment = new ProcessAttachment({
      processPlanId,
      stageId: stageId || null,
      activityId: activityId || null,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/process/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy,
      companyId,
      uploadedAt: new Date(),
    });

    await attachment.save();

    // Add to plan history
    plan.history.push({
      user: uploadedBy,
      action: "File Uploaded",
      oldValue: "",
      newValue: `Uploaded: ${req.file.originalname}`,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error("Error deleting file on error:", err);
      }
    }
    res.status(500).json({ error: error.message });
  }
};
/**
 * Get all attachments for a process plan
 * GET /api/process/attachments/plan/:planId
 */
exports.getAttachmentsByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const companyId = getCompanyId(req);

    const query = { processPlanId: planId, isActive: true };
    if (companyId) query.companyId = companyId;

    const attachments = await ProcessAttachment.find(query).sort({
      uploadedAt: -1,
    });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get attachments for a specific stage
 * GET /api/process/attachments/stage/:stageId
 */
exports.getAttachmentsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const companyId = getCompanyId(req);

    const query = { stageId, isActive: true };
    if (companyId) query.companyId = companyId;

    const attachments = await ProcessAttachment.find(query).sort({
      uploadedAt: -1,
    });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get attachments for a specific activity
 * GET /api/process/attachments/activity/:activityId
 */
exports.getAttachmentsByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const companyId = getCompanyId(req);

    const query = { activityId, isActive: true };
    if (companyId) query.companyId = companyId;

    const attachments = await ProcessAttachment.find(query).sort({
      uploadedAt: -1,
    });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete an attachment
 * DELETE /api/process/attachments/:id
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await ProcessAttachment.findById(id);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Delete physical file
    const filePath = path.join(
      __dirname,
      "../../uploads/process",
      attachment.fileName
    );
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    // Soft delete
    attachment.isActive = false;
    await attachment.save();

    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get attachment by ID
 * GET /api/process/attachments/:id
 */
exports.getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await ProcessAttachment.findById(id);
    if (!attachment || !attachment.isActive) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/project_planing/processAttachmentController.js

/**
 * Download attachment
 * GET /api/process/attachments/:id/download
 */
// controllers/project_planing/processAttachmentController.js

/**
 * Download attachment
 * GET /api/process/attachments/:id/download
 */
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await ProcessAttachment.findById(id);
    if (!attachment || !attachment.isActive) {
      return res.status(404).json({ 
        error: "Attachment not found",
        details: "The attachment record does not exist or has been deleted"
      });
    }

    // Try multiple possible file paths
    const possiblePaths = [
      // Path from database
      path.join(__dirname, "../..", attachment.fileUrl),
      // Uploads/process folder
      path.join(__dirname, "../../uploads/process", attachment.fileName),
      // Uploads folder root
      path.join(__dirname, "../../uploads", attachment.fileName),
      // Absolute path from project root
      path.join(process.cwd(), "uploads/process", attachment.fileName),
      path.join(process.cwd(), "uploads", attachment.fileName),
    ];

    // Also try with the original filename if it exists in uploads
    const originalNamePath = path.join(__dirname, "../../uploads/process", attachment.originalName);
    if (fs.existsSync(originalNamePath)) {
      possiblePaths.push(originalNamePath);
    }

    // Find the first existing file
    let filePath = null;
    for (const pathToCheck of possiblePaths) {
      console.log(`Checking path: ${pathToCheck}`);
      if (fs.existsSync(pathToCheck)) {
        filePath = pathToCheck;
        console.log(`✅ File found at: ${filePath}`);
        break;
      }
    }

    if (!filePath) {
      console.error(`❌ File not found for attachment ${id}`);
      console.error(`Searched paths:`, possiblePaths);
      return res.status(404).json({ 
        error: "File not found on server",
        details: "The file may have been deleted or moved",
        fileName: attachment.originalName,
        fileId: id
      });
    }

    // Get file stats for content length
    const stat = fs.statSync(filePath);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalName)}"`);
    res.setHeader('Content-Type', attachment.fileType || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ 
      error: "Failed to download file",
      details: error.message 
    });
  }
};