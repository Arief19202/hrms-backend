const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    me
} = require("../controllers/authController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const {
    registerValidationRules,
    loginValidationRules,
    validate
} = require("../validators/authValidator");

router.post(
    "/register",
    registerValidationRules,
    validate,
    register
);

router.post(
    "/login",
    loginValidationRules,
    validate,
    login
);

router.post(
    "/logout",
    authenticate,
    logout
);

router.get(
    "/me",
    authenticate,
    me
);

router.get(
    "/admin-only",
    authenticate,
    authorize("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome Admin"
        });
    }
);

module.exports = router;