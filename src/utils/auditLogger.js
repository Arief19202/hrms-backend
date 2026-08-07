const auditLogModel = require("../models/auditLogModel");

const getClientIp = (req) => {
    if (!req) return "N/A";
    const forwarded = req.headers ? req.headers["x-forwarded-for"] : null;
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || "N/A";
};

const logAudit = async (req, { action, entity, entityId, details }) => {
    try {
        const user = req?.user || {};
        const ipAddress = getClientIp(req);

        await auditLogModel.create({
            user_id: user.userId || user.id || null,
            user_email: user.email || (req?.body?.email ? req.body.email : "system@hrms.internal"),
            user_name: user.name || user.email || "System User",
            user_role: user.role || "unknown",
            action,
            entity,
            entity_id: entityId ? String(entityId) : null,
            details: details || {},
            ip_address: ipAddress
        });
    } catch (error) {
        console.warn("Error in logAudit utility:", error.message || error);
    }
};

module.exports = {
    logAudit,
    getClientIp
};
