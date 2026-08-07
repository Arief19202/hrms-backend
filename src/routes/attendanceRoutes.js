const express = require("express");
const router = express.Router();

const {
    getAttendances,
    getAttendance,
    getTodayAttendanceRecord,
    getMyAttendanceHistory,
    employeeCheckIn,
    employeeCheckOut,
    addAttendance,
    editAttendance,
    removeAttendance
} = require("../controllers/attendanceController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const {
    createAttendanceValidationRules,
    updateAttendanceValidationRules,
    validate
} = require("../validators/attendanceValidator");

// ==========================================
// Employee Self Service (ESS)
// ==========================================

// Get Today's Attendance
router.get(
    "/today",
    authenticate,
    authorize("employee", "hr", "admin"),
    getTodayAttendanceRecord
);

// Get My Attendance History
router.get(
    "/my",
    authenticate,
    authorize("employee", "hr", "admin"),
    getMyAttendanceHistory
);

// Check In
router.post(
    "/check-in",
    authenticate,
    authorize("employee", "hr", "admin"),
    employeeCheckIn
);

// Check Out
router.post(
    "/check-out",
    authenticate,
    authorize("employee", "hr", "admin"),
    employeeCheckOut
);

// ==========================================
// Admin / HR Attendance Management
// ==========================================

// Get All Attendances
router.get(
    "/",
    authenticate,
    authorize("admin", "hr"),
    getAttendances
);

// Get Attendance By ID
// IMPORTANT: mesti selepas /today
router.get(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    getAttendance
);

// Create Attendance
router.post(
    "/",
    authenticate,
    authorize("admin", "hr"),
    createAttendanceValidationRules,
    validate,
    addAttendance
);

// Update Attendance
router.patch(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    updateAttendanceValidationRules,
    validate,
    editAttendance
);

// Delete Attendance
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    removeAttendance
);

module.exports = router;