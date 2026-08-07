const {
    getAllLeaves,
    getLeaveById,
    getMyLeaves,
    createLeaveRequest,
    updateLeave,
    deleteLeave,
    updateLeaveStatus: updateLeaveStatusService
} = require("../services/leaveService");
const { logAudit } = require("../utils/auditLogger");

const getLeaves = async (req, res, next) => {
    try {
        const leaves = await getAllLeaves();

        return res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });

    } catch (error) {
        next(error);
    }
};

const getLeave = async (req, res, next) => {
    try {
        const leave = await getLeaveById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: leave
        });

    } catch (error) {
        next(error);
    }
};

const addLeaveRequest = async (req, res, next) => {
    try {

        const {
            leave_type,
            start_date,
            end_date,
            reason
        } = req.body;

        if (!leave_type || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Leave type, start date and end date are required"
            });
        }

        const allowedLeaveTypes = [
            "annual",
            "sick",
            "emergency",
            "unpaid"
        ];

        if (!allowedLeaveTypes.includes(leave_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type"
            });
        }

        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be earlier than start date"
            });
        }

        const { findByUserId } = require("../models/employeeModel");
        let employee_id = req.body.employee_id;
        if (!employee_id && req.user?.userId) {
            const employee = await findByUserId(req.user.userId);
            if (employee && employee.id) {
                employee_id = employee.id;
            }
        }
        if (!employee_id) {
            employee_id = req.user.employeeId;
        }

        if (!employee_id) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const total_days =
            Math.floor(
                (new Date(end_date) - new Date(start_date)) /
                (1000 * 60 * 60 * 24)
            ) + 1;

        const leave = await createLeaveRequest({
            employee_id,
            leave_type,
            start_date,
            end_date,
            total_days,
            reason: reason || null,
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            rejection_reason: null
        });

        logAudit(req, {
            action: "CREATE_LEAVE",
            entity: "LEAVE",
            entityId: leave.id,
            details: { leave_type, start_date, end_date, total_days, reason }
        });

        return res.status(201).json({
            success: true,
            message: "Leave request created successfully",
            data: leave
        });

    } catch (error) {

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Employee does not exist"
            });
        }

        if (error.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "Invalid leave request data"
            });
        }

        next(error);

    }
};

const updateLeaveStatus = async (req, res, next) => {

    try {

        const { id } = req.params;

        const {
            status,
            reviewed_by,
            rejection_reason
        } = req.body;

        if (!status || !reviewed_by) {
            return res.status(400).json({
                success: false,
                message: "Status and reviewed_by are required"
            });
        }

        const allowedStatus = [
            "approved",
            "rejected"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const reviewed_at = new Date().toISOString();

        const leave = await updateLeaveStatusService(
            id,
            status,
            reviewed_by,
            reviewed_at,
            rejection_reason || null
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        logAudit(req, {
            action: status === "approved" ? "APPROVE_LEAVE" : "REJECT_LEAVE",
            entity: "LEAVE",
            entityId: leave.id,
            details: { status, reviewed_by, rejection_reason }
        });

        return res.status(200).json({
            success: true,
            message: `Leave request ${status} successfully`,
            data: leave
        });

    } catch (error) {

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "Reviewer does not exist"
            });
        }

        next(error);

    }

};

const editLeave = async (req, res, next) => {

    try {

        const leave = await updateLeave(
            req.params.id,
            req.body
        );

        logAudit(req, {
            action: "UPDATE_LEAVE",
            entity: "LEAVE",
            entityId: req.params.id,
            details: { updatedFields: Object.keys(req.body) }
        });

        return res.status(200).json({
            success: true,
            message: "Leave updated successfully",
            data: leave
        });

    } catch (error) {
        next(error);
    }

};

const deleteLeaveRequest = async (req, res, next) => {

    try {

        await deleteLeave(req.params.id);

        logAudit(req, {
            action: "DELETE_LEAVE",
            entity: "LEAVE",
            entityId: req.params.id,
            details: { message: "Leave deleted" }
        });

        return res.status(200).json({
            success: true,
            message: "Leave deleted successfully"
        });

    } catch (error) {
        next(error);
    }

};

const getMyLeaveRequests = async (req, res, next) => {

    try {

        const { findByUserId } = require("../models/employeeModel");
        let employeeId = null;
        if (req.user?.userId) {
            const employee = await findByUserId(req.user.userId);
            if (employee && employee.id) {
                employeeId = employee.id;
            }
        }
        if (!employeeId) {
            employeeId = req.user.employeeId;
        }

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const leaves = await getMyLeaves(employeeId);

        return res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    getLeaves,
    getLeave,
    addLeaveRequest,
    editLeave,
    deleteLeaveRequest,
    updateLeaveStatus,
    getMyLeaveRequests
};