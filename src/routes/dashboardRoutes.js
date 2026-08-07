const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getAttendanceChart,
  getDepartmentChart,
  getLeaveChart,
} = require("../controllers/dashboardController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticate,
  authorize("admin", "hr"),
  getDashboard
);

router.get(
  "/attendance-chart",
  authenticate,
  authorize("admin", "hr"),
  getAttendanceChart
);

router.get(
  "/department-chart",
  authenticate,
  authorize("admin", "hr"),
  getDepartmentChart
);

router.get(
  "/leave-chart",
  authenticate,
  authorize("admin", "hr"),
  getLeaveChart
);

module.exports = router;