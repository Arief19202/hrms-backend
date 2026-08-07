const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require("../services/departmentService");
const { logAudit } = require("../utils/auditLogger");

const getDepartments = async (req, res, next) => {
    try {

        const result = await getAllDepartments(req.query);

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        next(error);
    }
};

const getDepartment = async (req, res, next) => {
    try {

        const department = await getDepartmentById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });

    } catch (error) {
        next(error);
    }
};

const addDepartment = async (req, res, next) => {
    try {

        const department = await createDepartment(req.body);

        logAudit(req, {
            action: "CREATE_DEPARTMENT",
            entity: "DEPARTMENT",
            entityId: department.id,
            details: { name: department.name }
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department
        });

    } catch (error) {
        next(error);
    }
};

const editDepartment = async (req, res, next) => {
    try {

        const department = await updateDepartment(
            req.params.id,
            req.body
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        logAudit(req, {
            action: "UPDATE_DEPARTMENT",
            entity: "DEPARTMENT",
            entityId: department.id,
            details: { name: department.name, updatedFields: Object.keys(req.body) }
        });

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department
        });

    } catch (error) {
        next(error);
    }
};

const removeDepartment = async (req, res, next) => {
    try {

        const department = await deleteDepartment(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        logAudit(req, {
            action: "DELETE_DEPARTMENT",
            entity: "DEPARTMENT",
            entityId: req.params.id,
            details: { department }
        });

        res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            data: department
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Cannot delete department because it has active employees assigned to it."
            });
        }
        next(error);
    }
};

module.exports = {
    getDepartments,
    getDepartment,
    addDepartment,
    editDepartment,
    removeDepartment
};