const supabase = require("../config/supabaseClient");

const findAll = async (query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
        .from("departments")
        .select("*", { count: "exact" });

    if (search) {
        supabaseQuery = supabaseQuery.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await supabaseQuery
        .order("id", { ascending: true })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    };
};

const findById = async (id) => {
    const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;

    return data;
};

const findByName = async (name) => {
    const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("name", name)
        .maybeSingle();

    if (error) throw error;

    return data;
};

const create = async (departmentData) => {
    const { data, error } = await supabase
        .from("departments")
        .insert([departmentData])
        .select()
        .single();

    if (error) throw error;

    return data;
};

const update = async (id, departmentData) => {
    const { data, error } = await supabase
        .from("departments")
        .update(departmentData)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;

    return data;
};

const remove = async (id) => {
    const { data, error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;

    return data;
};

module.exports = {
    findAll,
    findById,
    findByName,
    create,
    update,
    remove,
};