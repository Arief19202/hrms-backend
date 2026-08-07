const {
    findAll,
    findById,
    findByEmployeeAndDate,
    findTodayAttendance,
    getTodayDateString,
    getZonedTime,
    findByEmployeeId,
    create,
    update,
    remove
} = require("../models/attendanceModel");

const getAllAttendances = async (query) => {
    return await findAll(query);
};

const getAttendanceById = async (id) => {
    return await findById(id);
};

const createAttendance = async (attendanceData) => {

    const existingAttendance = await findByEmployeeAndDate(
        attendanceData.employee_id,
        attendanceData.attendance_date
    );

    if (existingAttendance) {
        const error = new Error(
            "Attendance already exists for this employee on this date."
        );
        error.statusCode = 400;
        throw error;
    }

    if (!attendanceData.status && attendanceData.check_in) {
        const checkInDate = new Date(attendanceData.check_in);
        if (!isNaN(checkInDate.getTime())) {
            const { hour, minute } = getZonedTime(checkInDate, attendanceData.timeZone);
            attendanceData.status = (hour > 8 || (hour === 8 && minute > 5)) ? "late" : "present";
        } else {
            attendanceData.status = "present";
        }
    }

    return await create(attendanceData);
};

const updateAttendance = async (id, attendanceData) => {

    const attendance = await findById(id);

    if (!attendance) {
        return null;
    }

    return await update(id, attendanceData);
};

const deleteAttendance = async (id) => {

    const attendance = await findById(id);

    if (!attendance) {
        return null;
    }

    return await remove(id);
};

const getTodayAttendance = async (employeeId, timeZone) => {
    return await findTodayAttendance(employeeId, timeZone);
};

const checkIn = async (employeeId, timeZone) => {

    const now = new Date();
    const today = getTodayDateString(timeZone);

    const attendance = await findTodayAttendance(employeeId, timeZone);

    if (attendance) {
        throw new Error("You have already checked in today.");
    }

    // Company operation hours: 8:00 AM to 5:00 PM
    // Grace period for Check In: 8:05 AM
    const { hour, minute } = getZonedTime(now, timeZone);

    let status = "present";
    if (hour > 8 || (hour === 8 && minute > 5)) {
        status = "late";
    }

    return await create({
        employee_id: employeeId,
        attendance_date: today,
        check_in: now.toISOString(),
        check_out: null,
        status: status
    });
};

const checkOut = async (employeeId, timeZone) => {

    const now = new Date();
    const attendance = await findTodayAttendance(employeeId, timeZone);

    if (!attendance) {
        throw new Error("Please check in first.");
    }

    if (attendance.check_out) {
        throw new Error("You have already checked out.");
    }

    const { hour } = getZonedTime(now, timeZone);
    let notes = attendance.notes || "";

    if (hour < 17) {
        notes = notes ? `${notes} | Early Leave` : "Early Leave (Before 5:00 PM)";
    }

    return await update(
        attendance.id,
        {
            check_out: now.toISOString(),
            notes: notes
        }
    );
};

const getEmployeeAttendanceHistory = async (employeeId) => {
    return await findByEmployeeId(employeeId);
};

module.exports = {
    getAllAttendances,
    getAttendanceById,
    getTodayAttendance,
    getEmployeeAttendanceHistory,
    checkIn,
    checkOut,
    createAttendance,
    updateAttendance,
    deleteAttendance
};