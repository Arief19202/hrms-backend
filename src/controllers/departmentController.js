const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require("../services/departmentService");

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

        res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            data: department
        });

    } catch (error) {
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