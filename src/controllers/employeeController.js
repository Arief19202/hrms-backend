const {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByUserId,
    createEmployee,
    updateEmployee,
    deleteEmployee
} = require("../services/employeeService");
const { logAudit } = require("../utils/auditLogger");

const getEmployees = async (req, res, next) => {
    try {

        const result = await getAllEmployees(req.query);

        return res.status(200).json({
            success: true,
            pagination: result.pagination,
            data: result.data
        });

    } catch (error) {
        next(error);
    }
};

const getEmployee = async (req, res, next) => {
    try {

        const employee = await getEmployeeById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

const addEmployee = async (req, res, next) => {
    try {

        const newEmployee = await createEmployee(req.body);

        logAudit(req, {
            action: "CREATE_EMPLOYEE",
            entity: "EMPLOYEE",
            entityId: newEmployee.id,
            details: { name: newEmployee.name, email: newEmployee.email, code: newEmployee.employee_code }
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: newEmployee
        });

    } catch (error) {
        next(error);
    }
};

const editEmployee = async (req, res, next) => {
    try {

        const updatedEmployee = await updateEmployee(
            req.params.id,
            req.body
        );

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        logAudit(req, {
            action: "UPDATE_EMPLOYEE",
            entity: "EMPLOYEE",
            entityId: updatedEmployee.id,
            details: { updatedFields: Object.keys(req.body), name: updatedEmployee.name }
        });

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee
        });

    } catch (error) {
        next(error);
    }
};

const removeEmployee = async (req, res, next) => {
    try {

        const deletedEmployee = await deleteEmployee(req.params.id);

        if (!deletedEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        logAudit(req, {
            action: "DELETE_EMPLOYEE",
            entity: "EMPLOYEE",
            entityId: req.params.id,
            details: { deletedEmployee }
        });

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            data: deletedEmployee
        });

    } catch (error) {
        next(error);
    }
};

// ========================================
// Employee Self Service (ESS)
// ========================================

const getMyProfile = async (req, res, next) => {
    try {

        const employee = await getEmployeeByUserId(req.user.userId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });

    } catch (error) {
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
    try {

        const employee = await getEmployeeByUserId(req.user.userId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found"
            });
        }

        // Field yang employee dibenarkan update sahaja
        const {
            name,
            email,
            phone
        } = req.body;

        const updatedEmployee = await updateEmployee(
            employee.id,
            {
                name,
                email,
                phone
            }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedEmployee
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEmployees,
    getEmployee,
    addEmployee,
    editEmployee,
    removeEmployee,
    getMyProfile,
    updateMyProfile
};