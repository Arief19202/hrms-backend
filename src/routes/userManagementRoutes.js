const express = require("express");
const router = express.Router();

const {
    createUserValidationRules,
    updateUserValidationRules,
    resetPasswordValidationRules,
    updateUserStatusValidationRules,
    validate
} = require("../validators/userValidator");

const {
    getUsers,
    getUser,
    addUser,
    editUser,
    resetUserPassword,
    changeUserStatus,
    removeUser
} = require("../controllers/userManagementController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

// Get All Users
router.get(
    "/",
    authenticate,
    authorize("admin"),
    getUsers
);

// Create User
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createUserValidationRules,
    validate,
    addUser
);

// Reset Password
router.patch(
    "/:id/reset-password",
    authenticate,
    authorize("admin"),
    resetPasswordValidationRules,
    validate,
    resetUserPassword
);

// Activate / Deactivate User
router.patch(
    "/:id/status",
    authenticate,
    authorize("admin"),
    updateUserStatusValidationRules,
    validate,
    changeUserStatus
);

// Get User By ID
router.get(
    "/:id",
    authenticate,
    authorize("admin"),
    getUser
);

// Update User
router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    updateUserValidationRules,
    validate,
    editUser
);

// Delete User
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    removeUser
);

module.exports = router;