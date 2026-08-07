const supabase = require("../config/supabaseClient");
const { getTodayDateString } = require("./attendanceModel");

const getStatistics = async (timeZone) => {

    const today = getTodayDateString(timeZone);

    const [
        employees,
        departments,
        attendance,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        recentLeaves
    ] = await Promise.all([

        supabase
            .from("employees")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("departments")
            .select("*", { count: "exact", head: true }),

        supabase
            .from("attendances")
            .select("*", { count: "exact", head: true })
            .eq("attendance_date", today),

        supabase
            .from("leave_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("leave_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved"),

        supabase
            .from("leave_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "rejected"),

        supabase
            .from("leave_requests")
            .select(`
                *,
                employees(
                    id,
                    name
                )
            `)
            .order("created_at", {
                ascending: false
            })
            .limit(5)

    ]);

    return {

        employees: employees.count || 0,

        departments: departments.count || 0,

        attendance: attendance.count || 0,
        todayAttendance: attendance.count || 0,
        todayDate: today,

        pendingLeaves: pendingLeaves.count || 0,

        approvedLeaves: approvedLeaves.count || 0,

        rejectedLeaves: rejectedLeaves.count || 0,

        recentLeaves: recentLeaves.data || []

    };

};

const getLeaveChart = async () => {
  const { data, error } = await supabase
    .from("leave_requests")
    .select("status");

  if (error) throw error;

  const result = {
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  data.forEach((leave) => {
    if (result[leave.status] !== undefined) {
      result[leave.status]++;
    }
  });

  return [
    {
      name: "Approved",
      value: result.approved,
    },
    {
      name: "Pending",
      value: result.pending,
    },
    {
      name: "Rejected",
      value: result.rejected,
    },
  ];
};

const getDepartmentChart = async () => {
  const { data, error } = await supabase
    .from("departments")
    .select(`
      name,
      employees(count)
    `);

  if (error) throw error;

  return data.map((department) => ({
    department: department.name,
    employees: Array.isArray(department.employees) && department.employees[0]
      ? department.employees[0].count
      : 0,
  }));
};

const getAttendanceChart = async () => {
  const { data, error } = await supabase
    .from("attendances")
    .select("attendance_date")
    .order("attendance_date", { ascending: true });

  if (error) throw error;

  const grouped = {};

  data.forEach((item) => {
    grouped[item.attendance_date] = (grouped[item.attendance_date] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, attendance]) => ({
    date,
    attendance,
  }));
};

module.exports = {
  getStatistics,
  getLeaveChart,
  getDepartmentChart,
  getAttendanceChart,
};