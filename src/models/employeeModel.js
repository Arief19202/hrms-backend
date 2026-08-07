const supabase = require("../config/supabaseClient");

const findAll = async (query = {}) => {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
    .from("employees")
    .select(
        `
        *,
        departments (
            id,
            name
        )
        `,
        { count: "exact" }
    );

    // Search
    if (query.search) {
        supabaseQuery = supabaseQuery.or(
            `name.ilike.%${query.search}%,email.ilike.%${query.search}%`
        );
    }

    // Filter Department
    if (query.department_id) {
        supabaseQuery = supabaseQuery.eq(
            "department_id",
            query.department_id
        );
    }

    // Filter Status
    if (query.status) {
        supabaseQuery = supabaseQuery.eq(
            "status",
            query.status
        );
    }

    // Sorting
    const sortBy = query.sort || "id";
    const order = query.order === "desc";

    supabaseQuery = supabaseQuery.order(
        sortBy,
        { ascending: !order }
    );

    // Pagination
    supabaseQuery = supabaseQuery.range(from, to);

    const {
        data,
        error,
        count
    } = await supabaseQuery;

    if (error) {
        throw error;
    }

    return {
        data,
        pagination: {
            page,
            limit,
            totalRecords: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const findById = async (id) => {

    const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const create = async (employeeData) => {

    const { data, error } = await supabase
        .from("employees")
        .insert([employeeData])
        .select(`
             *,
            departments (
            id,
            name
        )
    `)
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const update = async (id, employeeData) => {

    const { data, error } = await supabase
        .from("employees")
        .update(employeeData)
        .eq("id", id)
        .select(`
             *,
            departments (
            id,
            name
        )
    `)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const remove = async (id) => {

    // Unlink employee from any user accounts
    await supabase
        .from("users")
        .update({ employee_id: null })
        .eq("employee_id", id);

    // Delete employee attendance records
    await supabase
        .from("attendances")
        .delete()
        .eq("employee_id", id);

    // Delete employee leave requests
    await supabase
        .from("leave_requests")
        .delete()
        .eq("employee_id", id);

    const { data, error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const updateAnnualLeaveBalance = async (id, balance) => {

    const { data, error } = await supabase
        .from("employees")
        .update({
            annual_leave_balance: balance
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const findByUserId = async (userId) => {

    const { data: user, error } = await supabase
        .from("users")
        .select(`
            id,
            name,
            email,
            employee_id,
            employees (
                *
            )
        `)
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!user) {
        return null;
    }

    if (user.employees) {
        return user.employees;
    }

    // Check if employee with matching email exists
    if (user.email) {
        const { data: matchedEmp } = await supabase
            .from("employees")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

        if (matchedEmp) {
            await supabase
                .from("users")
                .update({ employee_id: matchedEmp.id })
                .eq("id", userId);

            return matchedEmp;
        }
    }

    // Auto-create employee record if user has no employee profile
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

    const { data: newEmployee, error: createError } = await supabase
        .from("employees")
        .insert([{
            name: user.name || "Employee",
            email: user.email,
            phone: "-",
            department_id: 1,
            employee_code: employeeCode,
            position: "Staff",
            salary: 0,
            hire_date: new Date().toISOString().split("T")[0],
            status: "active",
            annual_leave_balance: 14,
            used_annual_leave: 0,
            total_annual_leave: 14
        }])
        .select()
        .single();

    if (createError) {
        throw createError;
    }

    if (newEmployee) {
        await supabase
            .from("users")
            .update({ employee_id: newEmployee.id })
            .eq("id", userId);
    }

    return newEmployee || null;
};

const getLatestEmployeeCode = async () => {

    const { data, error } = await supabase
        .from("employees")
        .select("employee_code")
        .order("employee_code", {
            ascending: false
        })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const updateLeaveSummary = async (
    id,
    annual_leave_balance,
    used_annual_leave
) => {

    const { data, error } = await supabase
        .from("employees")
        .update({
            annual_leave_balance,
            used_annual_leave
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    findAll,
    findById,
    findByUserId,
    create,
    update,
    remove,
    updateAnnualLeaveBalance,
    updateLeaveSummary,
    getLatestEmployeeCode
};