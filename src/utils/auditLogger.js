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

        const userId = user.userId || user.id || null;
        let userEmail = user.email || (req?.body?.email ? req.body.email : null);
        let userName = user.name || null;
        let userRole = user.role || "unknown";

        // Fallback user lookup if email or name missing
        if ((!userEmail || !userName) && userId) {
            try {
                const userModel = require("../models/userModel");
                const u = await userModel.findById(userId);
                if (u) {
                    userEmail = userEmail || u.email;
                    userName = userName || u.name;
                    userRole = userRole !== "unknown" ? userRole : u.role;
                }
            } catch (e) {
                // Silently ignore fallback error
            }
        }

        await auditLogModel.create({
            user_id: userId ? String(userId) : null,
            user_email: userEmail || "system@hrms.internal",
            user_name: userName || userEmail || "System User",
            user_role: userRole,
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
