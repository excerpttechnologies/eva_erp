// // middlewares/upload.js
// const multer = require('multer');
// const path = require('path');

// // Configure local storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Folder to store uploaded files
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });

// module.exports = upload;













// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Define upload directories
const UPLOAD_DIRS = {
  root: 'uploads/',
  process: 'uploads/process/',
  profile: 'uploads/profile/',
  documents: 'uploads/documents/',
  // Add more as needed
};

// Create all directories
Object.values(UPLOAD_DIRS).forEach(dir => ensureDirectoryExists(dir));

// Configure storage with dynamic destination based on file type/context
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload folder based on route or field name
    let uploadPath = UPLOAD_DIRS.root;
    
    // Check if it's a process attachment
    if (req.path.includes('/process/attachments') || req.path.includes('/process-attachment')) {
      uploadPath = UPLOAD_DIRS.process;
    } 
    // Check if it's a profile image
    else if (req.path.includes('/profile') || req.fieldname === 'profileImage') {
      uploadPath = UPLOAD_DIRS.profile;
    }
    // Check if it's a document
    else if (req.path.includes('/document') || req.fieldname === 'document') {
      uploadPath = UPLOAD_DIRS.documents;
    }
    // Default to root uploads folder for backward compatibility
    else {
      uploadPath = UPLOAD_DIRS.root;
    }
    
    // Ensure directory exists
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    // Text
    'text/plain',
    'text/csv',
  ];
  
  // Check if file type is allowed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per upload
  }
});

// Export the upload middleware with additional configurations
module.exports = upload;

// Export helper functions for file management
module.exports.fileHelpers = {
  // Delete a file from the server
  deleteFile: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
  
  // Get file size in human readable format
  getFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Get file extension
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },
  
  // Get file type category
  getFileCategory: (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'spreadsheet';
    if (mimetype.includes('zip') || mimetype.includes('compressed')) return 'archive';
    return 'other';
  },
  
  // Check if file exists
  fileExists: (filePath) => {
    return fs.existsSync(filePath);
  },
  
  // Get file stats
  getFileStats: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        return fs.statSync(filePath);
      }
      return null;
    } catch (error) {
      console.error('Error getting file stats:', error);
      return null;
    }
  }
};

// Export upload directory constants
module.exports.UPLOAD_DIRS = UPLOAD_DIRS;