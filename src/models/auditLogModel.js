const supabase = require("../config/supabaseClient");

const create = async (logData) => {
    try {
        const payload = {
            user_id: logData.user_id || null,
            user_email: logData.user_email || "system@hrms.internal",
            user_name: logData.user_name || "System",
            user_role: logData.user_role || "system",
            action: logData.action,
            entity: logData.entity,
            entity_id: logData.entity_id ? String(logData.entity_id) : null,
            details: logData.details || {},
            ip_address: logData.ip_address || "N/A",
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from("audit_logs")
            .insert([payload])
            .select()
            .maybeSingle();

        if (error) {
            console.warn("Audit Log insert warning:", error.message || error);
            return null;
        }

        return data;
    } catch (err) {
        console.warn("Audit Log insert exception:", err.message || err);
        return null;
    }
};

const findAll = async (query = {}) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
        .from("audit_logs")
        .select("*", { count: "exact" });

    // Filter by entity
    if (query.entity && query.entity !== "ALL") {
        supabaseQuery = supabaseQuery.eq("entity", query.entity);
    }

    // Filter by action
    if (query.action && query.action !== "ALL") {
        supabaseQuery = supabaseQuery.eq("action", query.action);
    }

    // Filter by User ID
    if (query.user_id) {
        supabaseQuery = supabaseQuery.eq("user_id", query.user_id);
    }

    // Filter by Date range
    if (query.startDate) {
        supabaseQuery = supabaseQuery.gte("created_at", `${query.startDate}T00:00:00.000Z`);
    }
    if (query.endDate) {
        supabaseQuery = supabaseQuery.lte("created_at", `${query.endDate}T23:59:59.999Z`);
    }

    // Search query (matches action, user_email, user_name, entity, entity_id)
    if (query.search && query.search.trim() !== "") {
        const searchTerm = query.search.trim();
        supabaseQuery = supabaseQuery.or(
            `action.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%,entity.ilike.%${searchTerm}%,entity_id.ilike.%${searchTerm}%`
        );
    }

    // Sorting
    const sortBy = query.sort || "created_at";
    const order = query.order === "asc";

    supabaseQuery = supabaseQuery.order(sortBy, { ascending: order });

    // Pagination
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
        // If table doesn't exist yet, return empty list gracefully
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
            return {
                data: [],
                pagination: {
                    page,
                    limit,
                    totalRecords: 0,
                    totalPages: 0
                }
            };
        }
        throw error;
    }

    const totalRecords = count || 0;

    return {
        data: data || [],
        pagination: {
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit) || 1
        }
    };
};

const getStats = async () => {
    try {
        const todayStr = new Date().toISOString().split("T")[0];

        const [allLogsRes, todayLogsRes] = await Promise.all([
            supabase.from("audit_logs").select("entity, user_email", { count: "exact" }),
            supabase
                .from("audit_logs")
                .select("id", { count: "exact" })
                .gte("created_at", `${todayStr}T00:00:00.000Z`)
        ]);

        const totalLogs = allLogsRes.count || 0;
        const todayCount = todayLogsRes.count || 0;

        const entityBreakdown = {};
        const uniqueUsers = new Set();

        if (allLogsRes.data) {
            allLogsRes.data.forEach((row) => {
                if (row.entity) {
                    entityBreakdown[row.entity] = (entityBreakdown[row.entity] || 0) + 1;
                }
                if (row.user_email) {
                    uniqueUsers.add(row.user_email);
                }
            });
        }

        return {
            totalLogs,
            todayCount,
            uniqueUsersCount: uniqueUsers.size,
            entityBreakdown
        };
    } catch (err) {
        return {
            totalLogs: 0,
            todayCount: 0,
            uniqueUsersCount: 0,
            entityBreakdown: {}
        };
    }
};

module.exports = {
    create,
    findAll,
    getStats
};
