const supabase = require("../config/supabaseClient");

const findAll = async (query = {}) => {

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = supabase
        .from("attendances")
        .select(
            `
            *,
            employees (
                id,
                name,
                email
            )
        `,
            {
                count: "exact",
            }
        );

    // Search Filter
    if (query.search && query.search.trim() !== "") {
        const keyword = query.search.trim();

        const { data: matchedEmployees } = await supabase
            .from("employees")
            .select("id")
            .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`);

        const matchedEmpIds = (matchedEmployees || []).map((e) => e.id);

        const conditions = [`status.ilike.%${keyword}%`];

        if (matchedEmpIds.length > 0) {
            conditions.push(`employee_id.in.(${matchedEmpIds.join(",")})`);
        }

        if (/^\d{4}(-\d{2}(-\d{2})?)?$/.test(keyword)) {
            conditions.push(`attendance_date.eq.${keyword}`);
        }

        supabaseQuery = supabaseQuery.or(conditions.join(","));
    }

    // Filter Status
    if (query.status) {
        supabaseQuery = supabaseQuery.eq(
            "status",
            query.status
        );
    }

    // Filter Attendance Date
    if (query.date) {
        supabaseQuery = supabaseQuery.eq(
            "attendance_date",
            query.date
        );
    }

    // Sorting
    const sortBy = query.sort || "attendance_date";
    const ascending = query.order === "asc";

    supabaseQuery = supabaseQuery
        .order(sortBy, { ascending })
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

const findById = async (id) => {

    const { data, error } = await supabase
        .from("attendances")
        .select(
            `
            *,
            employees (
                id,
                name,
                email
            )
        `
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const findByEmployeeAndDate = async (
    employeeId,
    attendanceDate
) => {

    const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("attendance_date", attendanceDate)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const getZonedTime = (date = new Date(), timeZone) => {
    let tz = timeZone || process.env.TIMEZONE;
    if (!tz || tz === "UTC") {
        tz = "Asia/Kuala_Lumpur";
    }
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23"
    });
    const parts = formatter.formatToParts(date);
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
        if (part.type === "hour") hour = parseInt(part.value, 10);
        if (part.type === "minute") minute = parseInt(part.value, 10);
    }
    if (hour === 24) hour = 0;
    return { hour, minute };
};

const getTodayDateString = (timeZone) => {
    let tz = timeZone || process.env.TIMEZONE;
    if (!tz || tz === "UTC") {
        tz = "Asia/Kuala_Lumpur";
    }
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(now);
    return `${year}-${month}-${day}`;
};

const findTodayAttendance = async (employeeId, timeZone) => {

    const today = getTodayDateString(timeZone);

    const { data, error } = await supabase
        .from("attendances")
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
        .eq("attendance_date", today)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const create = async (attendanceData) => {

    const { data, error } = await supabase
        .from("attendances")
        .insert([attendanceData])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

const update = async (id, attendanceData) => {

    const { data, error } = await supabase
        .from("attendances")
        .update({
            ...attendanceData,
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

const remove = async (id) => {

    const { data, error } = await supabase
        .from("attendances")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
};

const findByEmployeeId = async (employeeId) => {

    const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("employee_id", employeeId)
        .order("attendance_date", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
};

module.exports = {
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
};