const {
    getAllAttendances,
    getAttendanceById,
    getTodayAttendance,
    checkIn,
    checkOut,
    createAttendance,
    updateAttendance,
    deleteAttendance
} = require("../services/attendanceService");
const { logAudit } = require("../utils/auditLogger");

const getAttendances = async (req, res, next) => {
    try {

        const result = await getAllAttendances(req.query);

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        next(error);
    }
};

const getAttendance = async (req, res, next) => {
    try {

        const attendance = await getAttendanceById(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance not found"
            });
        }

        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};

const addAttendance = async (req, res, next) => {
    try {

        const attendance = await createAttendance(req.body);

        logAudit(req, {
            action: "CREATE_ATTENDANCE",
            entity: "ATTENDANCE",
            entityId: attendance.id,
            details: { employee_id: attendance.employee_id, date: attendance.date, status: attendance.status }
        });

        res.status(201).json({
            success: true,
            message: "Attendance created successfully",
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};

const editAttendance = async (req, res, next) => {
    try {

        const attendance = await updateAttendance(
            req.params.id,
            req.body
        );

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance not found"
            });
        }

        logAudit(req, {
            action: "UPDATE_ATTENDANCE",
            entity: "ATTENDANCE",
            entityId: attendance.id,
            details: { updatedFields: Object.keys(req.body) }
        });

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};

const removeAttendance = async (req, res, next) => {
    try {

        const attendance = await deleteAttendance(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance not found"
            });
        }

        logAudit(req, {
            action: "DELETE_ATTENDANCE",
            entity: "ATTENDANCE",
            entityId: req.params.id,
            details: { attendance }
        });

        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully",
            data: attendance
        });

    } catch (error) {
        next(error);
    }
};

const { findByUserId } = require("../models/employeeModel");

const resolveEmployeeId = async (user) => {
    if (user?.userId) {
        const employee = await findByUserId(user.userId);
        if (employee && employee.id) {
            return employee.id;
        }
    }
    if (user?.employeeId) {
        return user.employeeId;
    }
    return null;
};

const getTodayAttendanceRecord = async (req, res, next) => {

    try {

        const employeeId = await resolveEmployeeId(req.user);

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const timeZone = req.headers["x-timezone"] || req.query.timeZone;
        const attendance = await getTodayAttendance(employeeId, timeZone);

        return res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (error) {
        next(error);
    }

};

const employeeCheckIn = async (req, res, next) => {

    try {

        const employeeId = await resolveEmployeeId(req.user);

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const timeZone = req.headers["x-timezone"] || req.body?.timeZone;
        const attendance = await checkIn(employeeId, timeZone);

        logAudit(req, {
            action: "CLOCK_IN",
            entity: "ATTENDANCE",
            entityId: attendance?.id,
            details: { clock_in: attendance?.clock_in, date: attendance?.date }
        });

        return res.status(201).json({
            success: true,
            message: "Check in successful",
            data: attendance
        });

    } catch (error) {
        next(error);
    }

};

const employeeCheckOut = async (req, res, next) => {

    try {

        const employeeId = await resolveEmployeeId(req.user);

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const timeZone = req.headers["x-timezone"] || req.body?.timeZone;
        const attendance = await checkOut(employeeId, timeZone);

        logAudit(req, {
            action: "CLOCK_OUT",
            entity: "ATTENDANCE",
            entityId: attendance?.id,
            details: { clock_out: attendance?.clock_out, work_hours: attendance?.work_hours }
        });

        return res.status(200).json({
            success: true,
            message: "Check out successful",
            data: attendance
        });

    } catch (error) {
        next(error);
    }

};

const getMyAttendanceHistory = async (req, res, next) => {

    try {

        const employeeId = await resolveEmployeeId(req.user);

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "No employee profile found for this user account."
            });
        }

        const { getEmployeeAttendanceHistory } = require("../services/attendanceService");
        const history = await getEmployeeAttendanceHistory(employeeId);

        return res.status(200).json({
            success: true,
            data: history || []
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    getAttendances,
    getAttendance,
    getTodayAttendanceRecord,
    getMyAttendanceHistory,
    employeeCheckIn,
    employeeCheckOut,
    addAttendance,
    editAttendance,
    removeAttendance
};