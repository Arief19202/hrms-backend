const express = require("express");
const router = express.Router();
const { getAuditLogs, getAuditLogStats } = require("../controllers/auditLogController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// All audit log routes require authentication and Admin role
router.get("/", authenticate, authorize("admin"), getAuditLogs);
router.get("/stats", authenticate, authorize("admin"), getAuditLogStats);

module.exports = router;
