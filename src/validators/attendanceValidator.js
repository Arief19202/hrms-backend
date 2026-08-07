const { body, validationResult } = require("express-validator");

// Create Attendance Validation
const createAttendanceValidationRules = [
    body("employee_id")
        .notEmpty()
        .withMessage("Employee ID is required")
        .isInt({ min: 1 })
        .withMessage("Employee ID must be a valid number"),

    body("attendance_date")
        .notEmpty()
        .withMessage("Attendance date is required")
        .isISO8601()
        .withMessage("Attendance date must be a valid date"),

    body("check_in")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Check-in must be a valid datetime"),

    body("check_out")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Check-out must be a valid datetime"),

    body("status")
        .optional()
        .isIn([
            "present",
            "late",
            "absent",
            "on_leave"
        ])
        .withMessage("Invalid attendance status"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be text")
];

// Update Attendance Validation
const updateAttendanceValidationRules = [
    body("employee_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Employee ID must be a valid number"),

    body("attendance_date")
        .optional()
        .isISO8601()
        .withMessage("Attendance date must be a valid date"),

    body("check_in")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Check-in must be a valid datetime"),

    body("check_out")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Check-out must be a valid datetime"),

    body("status")
        .optional()
        .isIn([
            "present",
            "late",
            "absent",
            "on_leave"
        ])
        .withMessage("Invalid attendance status"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be text")
];

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

module.exports = {
    createAttendanceValidationRules,
    updateAttendanceValidationRules,
    validate
};