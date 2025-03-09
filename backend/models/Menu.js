const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
    이름: String,
    카테고리: String,
    태그: [String]
});

module.exports = mongoose.model("Menu", MenuSchema);
