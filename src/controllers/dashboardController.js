const {
  getDashboardStatistics,
  getDashboardLeaveChart,
  getDashboardDepartmentChart,
  getDashboardAttendanceChart,
} = require("../services/dashboardService");

const getDashboard = async (req, res, next) => {
    try {
        const timeZone = req.headers["x-timezone"] || req.query?.timeZone;
        const statistics = await getDashboardStatistics(timeZone);

        return res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        next(error);
    }
};

const getLeaveChart = async (req, res, next) => {
  try {
    const data = await getDashboardLeaveChart();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentChart = async (req, res, next) => {
  try {
    const data = await getDashboardDepartmentChart();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceChart = async (req, res, next) => {
  try {
    const data = await getDashboardAttendanceChart();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getLeaveChart,
  getDepartmentChart,
  getAttendanceChart,
};