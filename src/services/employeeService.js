const {
    findAll,
    findById,
    findByUserId,
    create,
    update,
    remove,
    updateAnnualLeaveBalance,
    getLatestEmployeeCode
} = require("../models/employeeModel");

const getAllEmployees = async (query) => {
    return await findAll(query);
};

const getEmployeeById = async (id) => {
    return await findById(id);
};

const createEmployee = async (employeeData) => {

    const latestEmployee = await getLatestEmployeeCode();

    let employeeCode = "EMP260001";

    if (latestEmployee?.employee_code) {

        const currentNumber = parseInt(
            latestEmployee.employee_code.substring(5),
            10
        );

        employeeCode = `EMP26${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const newEmployee = {
        ...employeeData,
        employee_code: employeeCode,
        annual_leave_balance: 14
    };

    return await create(newEmployee);
};

const updateEmployee = async (id, employeeData) => {

    const employee = await findById(id);

    if (!employee) {
        return null;
    }

    return await update(id, employeeData);
};

const deleteEmployee = async (id) => {

    const employee = await findById(id);

    if (!employee) {
        return null;
    }

    return await remove(id);
};

const getEmployeeByUserId = async (userId) => {
    return await findByUserId(userId);
};

const updateEmployeeAnnualLeaveBalance = async (
    employeeId,
    balance
) => {
    return await updateAnnualLeaveBalance(
        employeeId,
        balance
    );
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByUserId,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeAnnualLeaveBalance
};