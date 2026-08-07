const {
    body,
    validationResult
} = require("express-validator");

// ==========================================
// Create User Validation
// ==========================================

const createUserValidationRules = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email format."),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters."),

    body("role")
        .notEmpty()
        .withMessage("Role is required.")
        .isIn([
            "admin",
            "hr",
            "employee"
        ])
        .withMessage("Invalid role."),

    body("employee_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Employee ID must be an integer.")

];

// ==========================================
// Update User Validation
// ==========================================

const updateUserValidationRules = [

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty."),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email format."),

    body("password")
        .optional()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters."),

    body("role")
        .optional()
        .isIn([
            "admin",
            "hr",
            "employee"
        ])
        .withMessage("Invalid role."),

    body("employee_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Employee ID must be an integer.")

];

// ==========================================
// Reset Password Validation
// ==========================================

const resetPasswordValidationRules = [

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters.")

];

// ==========================================
// Update Status Validation
// ==========================================

const updateUserStatusValidationRules = [

    body("is_active")
        .isBoolean()
        .withMessage("is_active must be true or false.")

];

// ==========================================
// Validation Handler
// ==========================================

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
    createUserValidationRules,
    updateUserValidationRules,
    resetPasswordValidationRules,
    updateUserStatusValidationRules,
    validate
};