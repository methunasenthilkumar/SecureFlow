const AuditLog = require('../models/AuditLog');

const logAudit = async ({ user, userName, role, action, ipAddress = '127.0.0.1', details = {} }) => {
  try {
    await AuditLog.create({
      user: user || null,
      userName: userName || (user ? user.name : 'System'),
      role: role || (user ? user.role : 'system'),
      action,
      ipAddress,
      details
    });
  } catch (error) {
    console.error('Audit Logger Error:', error.message);
  }
};

module.exports = { logAudit };
