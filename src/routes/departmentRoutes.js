const express = require("express");
const router = express.Router();

const {
    getDepartments,
    getDepartment,
    addDepartment,
    editDepartment,
    removeDepartment
} = require("../controllers/departmentController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const {
    createDepartmentValidationRules,
    updateDepartmentValidationRules,
    validate
} = require("../validators/departmentValidator");

router.get(
    "/",
    authenticate,
    authorize("admin", "hr"),
    getDepartments
);

router.get(
    "/:id",
    authenticate,
    authorize("admin", "hr"),
    getDepartment
);

router.post(
    "/",
    authenticate,
    authorize("admin"),
    createDepartmentValidationRules,
    validate,
    addDepartment
);

router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    updateDepartmentValidationRules,
    validate,
    editDepartment
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    removeDepartment
);

module.exports = router;