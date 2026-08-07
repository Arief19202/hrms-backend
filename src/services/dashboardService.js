const {
  getStatistics,
  getLeaveChart,
  getDepartmentChart,
  getAttendanceChart,
} = require("../models/dashboardModel");

const getDashboardStatistics = async (timeZone) => {
  return await getStatistics(timeZone);
};

const getDashboardLeaveChart = async () => {
  return await getLeaveChart();
};

const getDashboardDepartmentChart = async () => {
  return await getDepartmentChart();
};

const getDashboardAttendanceChart = async () => {
  return await getAttendanceChart();
};

module.exports = {
  getDashboardStatistics,
  getDashboardLeaveChart,
  getDashboardDepartmentChart,
  getDashboardAttendanceChart,
};