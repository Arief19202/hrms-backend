const auditLogModel = require("../models/auditLogModel");

const getAuditLogs = async (req, res, next) => {
    try {
        const result = await auditLogModel.findAll(req.query);

        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

const getAuditLogStats = async (req, res, next) => {
    try {
        const stats = await auditLogModel.getStats();

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuditLogs,
    getAuditLogStats
};
