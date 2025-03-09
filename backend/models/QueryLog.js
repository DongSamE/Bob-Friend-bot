const mongoose = require("mongoose");

const QueryLogSchema = new mongoose.Schema({
    userId: String,
    query: String,
    recommended: [String],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QueryLog", QueryLogSchema);
