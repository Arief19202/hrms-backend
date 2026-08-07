const supabase = require("../config/supabaseClient");

const findByEmail = async (email) => {
    const { data, error } = await supabase
        .from("users")
        .select(`
            id,
            name,
            email,
            password,
            role,
            employee_id,
            is_active,
            created_at
        `)
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const findById = async (id) => {
    const { data, error } = await supabase
        .from("users")
        .select(`
            id,
            name,
            email,
            role,
            employee_id,
            is_active,
            created_at
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const create = async (userData) => {
    const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    findByEmail,
    findById,
    create
};