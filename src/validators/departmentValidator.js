const { body, validationResult } = require("express-validator");

// Create Department
const createDepartmentValidationRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Department name is required")
];

// Update Department
const updateDepartmentValidationRules = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Department name cannot be empty")
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
    createDepartmentValidationRules,
    updateDepartmentValidationRules,
    validate
};