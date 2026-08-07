const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const userManagementRoutes = require("./routes/userManagementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

const errorHandler = require("./middleware/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger-output.json");

const app = express();

// Middleware

// Allow React Frontend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());


// Swagger Documentation

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);


// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use(["/api/attendance", "/api/attendances"], attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userManagementRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Global Error Handler

app.use(errorHandler);

module.exports = app;