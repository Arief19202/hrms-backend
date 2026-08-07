const supabase = require("../config/supabaseClient");


// Get All Users
const findAll = async (query = {}) => {

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
        .from("users")
        .select(
            `
            id,
            name,
            email,
            role,
            is_active,
            employee_id,
            created_at,
            updated_at,
            employees (
                id,
                employee_code,
                department_id,
                departments (
                    id,
                    name
                )
            )
        `,
            {
                count: "exact"
            }
        );


    // Search

    if (query.search) {

        supabaseQuery = supabaseQuery.or(
            `name.ilike.%${query.search}%,email.ilike.%${query.search}%`
        );

    }

    // Filter Role

    if (query.role) {

        supabaseQuery = supabaseQuery.eq(
            "role",
            query.role
        );

    }

    // Filter Status

    if (query.is_active !== undefined) {

        supabaseQuery = supabaseQuery.eq(
            "is_active",
            query.is_active === "true"
        );

    }


    // Sorting

    const sortBy = query.sort || "created_at";

    const ascending =
        query.order === "asc";

    supabaseQuery = supabaseQuery
        .order(sortBy, {
            ascending
        })
        .range(from, to);

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

// Get User By ID
const findById = async (id) => {

    const { data, error } = await supabase
        .from("users")
        .select(`
            id,
            name,
            email,
            role,
            is_active,
            employee_id,
            created_at,
            updated_at,
            employees (
                id,
                employee_code,
                department_id,
                departments (
                    id,
                    name
                )
            )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};


// Get User By Email
const findByEmail = async (email) => {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};


// Create User
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


// Update User
const update = async (id, userData) => {

    const { data, error } = await supabase
        .from("users")
        .update({
            ...userData,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

// Delete User
const remove = async (id) => {

    const { data, error } = await supabase
        .from("users")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    remove
};