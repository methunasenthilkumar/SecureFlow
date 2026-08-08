const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: String,
  role: String,
  action: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  details: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
