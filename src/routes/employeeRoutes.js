const express = require("express");
const router = express.Router();

const {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  removeEmployee,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/employeeController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const {
  createEmployeeValidationRules,
  updateEmployeeValidationRules,
  validate,
} = require("../validators/employeeValidator");

// GET All Employees
router.get(
  "/",
  authenticate,
  authorize("admin", "hr"),
  getEmployees
);

// ==============================
// Employee Self Service (ESS)
// ==============================

// GET My Profile
router.get(
  "/profile",
  authenticate,
  authorize("employee", "hr", "admin"),
  getMyProfile
);

// UPDATE My Profile
router.patch(
  "/profile",
  authenticate,
  authorize("employee", "hr", "admin"),
  updateMyProfile
);

// GET Employee By ID
router.get(
  "/:id",
  authenticate,
  authorize("admin", "hr"),
  getEmployee
);

// CREATE Employee
router.post(
  "/",
  authenticate,
  authorize("admin", "hr"),
  createEmployeeValidationRules,
  validate,
  addEmployee
);

// UPDATE Employee
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "hr"),
  updateEmployeeValidationRules,
  validate,
  editEmployee
);

// DELETE Employee
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  removeEmployee
);

module.exports = router;