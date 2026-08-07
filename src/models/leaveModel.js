const supabase = require("../config/supabaseClient");

const findAll = async () => {
    const { data, error } = await supabase
        .from("leave_requests")
        .select(`
            *,
            employees (
                id,
                employee_code,
                name,
                email,
                annual_leave_balance
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

const findByEmployeeId = async (employeeId) => {

    const { data, error } = await supabase
        .from("leave_requests")
        .select(`
            *,
            employees (
                id,
                employee_code,
                name,
                email
            )
        `)
        .eq("employee_id", employeeId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    return data;
};

const findById = async (id) => {
    const { data, error } = await supabase
        .from("leave_requests")
        .select(`
            *,
            employees (
                id,
                employee_code,
                name,
                email,
                annual_leave_balance
            )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const create = async (leaveData) => {
    const { data, error } = await supabase
        .from("leave_requests")
        .insert([leaveData])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const updateLeaveStatus = async (
    id,
    status,
    reviewed_by,
    reviewed_at,
    rejection_reason = null
) => {

    const { data, error } = await supabase
        .from("leave_requests")
        .update({
            status,
            reviewed_by,
            reviewed_at,
            rejection_reason
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const update = async (id, leaveData) => {

    const { data, error } = await supabase
        .from("leave_requests")
        .update(leaveData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const remove = async (id) => {

    const { error } = await supabase
        .from("leave_requests")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return true;
};

module.exports = {
    findAll,
    findById,
    findByEmployeeId,
    create,
    update,
    remove,
    updateLeaveStatus
};