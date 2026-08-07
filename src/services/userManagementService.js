const bcrypt = require("bcrypt");

const {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    remove
} = require("../models/userManagementModel");


// Get All Users
const getAllUsers = async (query) => {
    return await findAll(query);
};


// Get User By ID
const getUserById = async (id) => {
    return await findById(id);
};


const supabase = require("../config/supabaseClient");
const {
    create: createEmployeeModel,
    update: updateEmployeeModel,
    getLatestEmployeeCode
} = require("../models/employeeModel");

// Create User
const createUser = async (userData) => {

    const existingUser = await findByEmail(
        userData.email
    );

    if (existingUser) {
        const error = new Error(
            "Email already exists."
        );
        error.statusCode = 400;
        throw error;
    }

    const allowedRoles = [
        "admin",
        "hr",
        "employee"
    ];

    if (!allowedRoles.includes(userData.role)) {
        const error = new Error(
            "Invalid role."
        );
        error.statusCode = 400;
        throw error;
    }

    const departmentId = userData.department_id;
    const userPayload = { ...userData };
    delete userPayload.department_id;

    const hashedPassword = await bcrypt.hash(
        userPayload.password,
        10
    );

    const newUser = await create({
        ...userPayload,
        password: hashedPassword,
        is_active:
            userPayload.is_active ?? true
    });

    if (departmentId && newUser) {
        try {
            const { data: matchedEmp } = await supabase
                .from("employees")
                .select("id")
                .eq("email", newUser.email)
                .maybeSingle();

            let empId = matchedEmp?.id;

            if (empId) {
                await updateEmployeeModel(empId, { department_id: Number(departmentId) });
            } else {
                const latestEmployee = await getLatestEmployeeCode();
                let employeeCode = "EMP260001";
                if (latestEmployee?.employee_code) {
                    const currentNumber = parseInt(
                        latestEmployee.employee_code.substring(5),
                        10
                    );
                    if (!isNaN(currentNumber)) {
                        employeeCode = `EMP26${String(currentNumber + 1).padStart(4, "0")}`;
                    }
                }

                const newEmp = await createEmployeeModel({
                    name: newUser.name || "Employee",
                    email: newUser.email,
                    phone: "-",
                    department_id: Number(departmentId),
                    employee_code: employeeCode,
                    position: "Staff",
                    salary: 0,
                    hire_date: new Date().toISOString().split("T")[0],
                    status: "active",
                    annual_leave_balance: 14,
                    used_annual_leave: 0,
                    total_annual_leave: 14
                });
                empId = newEmp?.id;
            }

            if (empId) {
                await update(newUser.id, { employee_id: empId });
            }
        } catch (err) {
            console.error("Failed to link/create employee for user:", err);
        }
    }

    return newUser;
};


// Update User
const updateUser = async (
    id,
    userData
) => {

    const user = await findById(id);

    if (!user) {
        return null;
    }

    if (userData.email) {

        const existingUser =
            await findByEmail(
                userData.email
            );

        if (
            existingUser &&
            existingUser.id !== Number(id)
        ) {

            const error = new Error(
                "Email already exists."
            );

            error.statusCode = 400;

            throw error;

        }

    }

    if (userData.role) {

        const allowedRoles = [
            "admin",
            "hr",
            "employee"
        ];

        if (
            !allowedRoles.includes(
                userData.role
            )
        ) {

            const error = new Error(
                "Invalid role."
            );

            error.statusCode = 400;

            throw error;

        }

    }

    const departmentId = userData.department_id;
    const updateData = { ...userData };
    delete updateData.department_id;

    if (!updateData.password) {
        delete updateData.password;
    } else {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await update(
        id,
        updateData
    );

    if (departmentId && updatedUser) {
        try {
            if (updatedUser.employee_id) {
                await updateEmployeeModel(updatedUser.employee_id, {
                    department_id: Number(departmentId)
                });
            } else {
                const { data: matchedEmp } = await supabase
                    .from("employees")
                    .select("id")
                    .eq("email", updatedUser.email)
                    .maybeSingle();

                let empId = matchedEmp?.id;

                if (empId) {
                    await updateEmployeeModel(empId, {
                        department_id: Number(departmentId)
                    });
                } else {
                    const latestEmployee = await getLatestEmployeeCode();
                    let employeeCode = "EMP260001";
                    if (latestEmployee?.employee_code) {
                        const currentNumber = parseInt(
                            latestEmployee.employee_code.substring(5),
                            10
                        );
                        if (!isNaN(currentNumber)) {
                            employeeCode = `EMP26${String(currentNumber + 1).padStart(4, "0")}`;
                        }
                    }

                    const newEmp = await createEmployeeModel({
                        name: updatedUser.name || "Employee",
                        email: updatedUser.email,
                        phone: "-",
                        department_id: Number(departmentId),
                        employee_code: employeeCode,
                        position: "Staff",
                        salary: 0,
                        hire_date: new Date().toISOString().split("T")[0],
                        status: "active",
                        annual_leave_balance: 14,
                        used_annual_leave: 0,
                        total_annual_leave: 14
                    });
                    empId = newEmp?.id;
                }

                if (empId) {
                    await update(updatedUser.id, { employee_id: empId });
                }
            }
        } catch (err) {
            console.error("Failed to update employee department for user:", err);
        }
    }

    return updatedUser;
};


// Reset Password
const resetPassword = async (
    id,
    newPassword
) => {

    const user = await findById(id);

    if (!user) {
        return null;
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    return await update(id, {
        password: hashedPassword
    });

};


// Change User Status
const updateUserStatus = async (
    id,
    is_active
) => {

    const user = await findById(id);

    if (!user) {
        return null;
    }

    return await update(id, {
        is_active
    });

};


// Delete User
const deleteUser = async (
    id
) => {

    const user = await findById(id);

    if (!user) {
        return null;
    }

    return await remove(id);

};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    resetPassword,
    updateUserStatus,
    deleteUser
};