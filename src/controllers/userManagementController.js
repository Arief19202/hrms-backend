const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    resetPassword,
    updateUserStatus,
    deleteUser
} = require("../services/userManagementService");
const { logAudit } = require("../utils/auditLogger");

// Get All Users
const getUsers = async (req, res, next) => {

    try {

        const result = await getAllUsers(req.query);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        next(error);
    }

};

// Get User By ID
const getUser = async (req, res, next) => {

    try {

        const user = await getUserById(req.params.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }

};


// Create User
const addUser = async (req, res, next) => {

    try {

        const {
            name,
            email,
            password,
            role,
            employee_id
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required."
            });

        }

        const user = await createUser({
            name,
            email,
            password,
            role,
            employee_id: employee_id || null
        });

        logAudit(req, {
            action: "CREATE_USER",
            entity: "USER",
            entityId: user.id,
            details: { name: user.name, email: user.email, role: user.role }
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }

};


// Update User
const editUser = async (req, res, next) => {

    try {

        const user = await updateUser(
            req.params.id,
            req.body
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        logAudit(req, {
            action: "UPDATE_USER",
            entity: "USER",
            entityId: user.id,
            details: { updatedFields: Object.keys(req.body) }
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }

};


// Reset Password
const resetUserPassword = async (
    req,
    res,
    next
) => {

    try {

        const { password } = req.body;

        if (!password) {

            return res.status(400).json({
                success: false,
                message: "Password is required."
            });

        }

        const user = await resetPassword(
            req.params.id,
            password
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        logAudit(req, {
            action: "RESET_PASSWORD",
            entity: "USER",
            entityId: user.id,
            details: { targetUserEmail: user.email }
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        next(error);
    }

};


// Activate / Deactivate User
const changeUserStatus = async (
    req,
    res,
    next
) => {

    try {

        const { is_active } = req.body;

        if (
            typeof is_active !== "boolean"
        ) {

            return res.status(400).json({
                success: false,
                message: "is_active must be true or false."
            });

        }

        const user =
            await updateUserStatus(
                req.params.id,
                is_active
            );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        logAudit(req, {
            action: "CHANGE_USER_STATUS",
            entity: "USER",
            entityId: user.id,
            details: { is_active, targetUserEmail: user.email }
        });

        return res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }

};


// Delete User
const removeUser = async (
    req,
    res,
    next
) => {

    try {

        const user = await deleteUser(
            req.params.id
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        logAudit(req, {
            action: "DELETE_USER",
            entity: "USER",
            entityId: user.id,
            details: { targetUserEmail: user.email, targetUserName: user.name }
        });

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    getUsers,
    getUser,
    addUser,
    editUser,
    resetUserPassword,
    changeUserStatus,
    removeUser
};