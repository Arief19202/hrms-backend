const {
    findAll,
    findById,
    findByEmployeeId,
    create,
    update,
    remove,
    updateLeaveStatus: updateLeaveStatusModel
} = require("../models/leaveModel");

const {
    findById: findEmployeeById,
    updateLeaveSummary
} = require("../models/employeeModel");

const getAllLeaves = async () => {
    return await findAll();
};

const getLeaveById = async (id) => {
    return await findById(id);
};

const createLeaveRequest = async (leaveData) => {
    let total_days = leaveData.total_days;
    if (!total_days && leaveData.start_date && leaveData.end_date) {
        const start = new Date(leaveData.start_date);
        const end = new Date(leaveData.end_date);
        if (!isNaN(start) && !isNaN(end) && end >= start) {
            const diffTime = Math.abs(end - start);
            total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    }
    leaveData.total_days = total_days || 1;

    // Check employee annual leave balance if leave_type is annual
    if (leaveData.leave_type === "annual") {
        const employee = await findEmployeeById(leaveData.employee_id);
        if (!employee) {
            const error = new Error("Employee profile not found.");
            error.statusCode = 404;
            throw error;
        }

        const currentBalance = Number(employee.annual_leave_balance || 0);

        if (currentBalance <= 0) {
            const error = new Error("Your annual leave balance is 0. You cannot submit an annual leave request.");
            error.statusCode = 400;
            throw error;
        }

        if (leaveData.total_days > currentBalance) {
            const error = new Error(
                `Requested leave duration (${leaveData.total_days} days) exceeds remaining annual leave balance (${currentBalance} days).`
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // Check for duplicate pending leave request
    const existingLeaves = await findByEmployeeId(leaveData.employee_id);
    const duplicate = (existingLeaves || []).find(
        (l) => l.status === "pending" && l.start_date === leaveData.start_date && l.end_date === leaveData.end_date
    );
    if (duplicate) {
        const error = new Error("A pending leave request for the exact same date range already exists.");
        error.statusCode = 400;
        throw error;
    }

    return await create(leaveData);
};

const updateLeave = async (id, leaveData) => {
    return await update(id, leaveData);
};

const deleteLeave = async (id) => {
    return await remove(id);
};

const getMyLeaves = async (employeeId) => {
    return await findByEmployeeId(employeeId);
};

const updateLeaveStatus = async (
    id,
    status,
    reviewed_by,
    reviewed_at,
    rejection_reason = null
) => {
    const leave = await findById(id);

    if (!leave) {
        return null;
    }

    const previousStatus = leave.status;
    const newStatus = status;

    if (previousStatus === newStatus) {
        return leave;
    }

    if (leave.leave_type === "annual") {
        const employee = await findEmployeeById(leave.employee_id);

        if (!employee) {
            throw new Error("Employee not found.");
        }

        const currentBalance = Number(employee.annual_leave_balance || 0);
        const currentUsed = Number(employee.used_annual_leave || 0);
        const totalDays = Number(leave.total_days || 0);

        // Transition to approved -> deduct balance
        if (previousStatus !== "approved" && newStatus === "approved") {
            if (currentBalance < totalDays) {
                throw new Error("Employee does not have enough annual leave balance.");
            }
            const newBalance = currentBalance - totalDays;
            const newUsed = currentUsed + totalDays;
            await updateLeaveSummary(employee.id, newBalance, newUsed);
        }
        // Transition from approved -> restore balance
        else if (previousStatus === "approved" && newStatus !== "approved") {
            const newBalance = currentBalance + totalDays;
            const newUsed = Math.max(0, currentUsed - totalDays);
            await updateLeaveSummary(employee.id, newBalance, newUsed);
        }
    }

    return await updateLeaveStatusModel(
        id,
        newStatus,
        reviewed_by,
        reviewed_at,
        rejection_reason
    );
};

module.exports = {
    getAllLeaves,
    getLeaveById,
    getMyLeaves,
    createLeaveRequest,
    updateLeave,
    deleteLeave,
    updateLeaveStatus
};