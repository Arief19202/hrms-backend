const express = require("express");
const router = express.Router();

const {
    getLeaves,
    getLeave,
    getMyLeaveRequests,
    addLeaveRequest,
    editLeave,
    deleteLeaveRequest,
    updateLeaveStatus
} = require("../controllers/leaveController");

const {
    authenticate,
    authorize,
} = require("../middleware/authMiddleware");

// GET All Leave Requests
router.get(
    "/",
    authenticate,
    authorize("admin", "hr"),
    getLeaves
);

router.get(
    "/my",
    authenticate,
    authorize("employee", "hr", "admin"),
    getMyLeaveRequests
);

router.post(
    "/request",
    authenticate,
    authorize("employee", "hr", "admin"),
    addLeaveRequest
);

router.post(
    "/",
    authenticate,
    authorize("admin","hr"),
    addLeaveRequest
);

// UPDATE Leave Status
router.patch(
    "/:id/status",
    authenticate,
    authorize("admin", "hr"),
    updateLeaveStatus
);

// GET Leave By ID
router.get(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    getLeave
);

// UPDATE Leave
router.patch(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    editLeave
);

// DELETE Leave
router.delete(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    deleteLeaveRequest
);

module.exports = router;