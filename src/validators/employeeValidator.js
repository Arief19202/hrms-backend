const { body, validationResult } = require("express-validator");

// Validation untuk CREATE employee
const createEmployeeValidationRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),

    body("department_id")
        .notEmpty()
        .withMessage("Department is required"),

    body("position")
        .optional()
        .trim()
        .isString()
        .withMessage("Position must be a string")
];

// Validation untuk UPDATE employee
const updateEmployeeValidationRules = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email"),

    body("department_id")
        .optional()
        .notEmpty()
        .withMessage("Department is required"),

    body("position")
        .optional()
        .trim()
        .isString()
        .withMessage("Position must be a string")
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
    createEmployeeValidationRules,
    updateEmployeeValidationRules,
    validate
};