const express = require("express");
const router = express.Router();
const { connectOracle } = require("../database/oracle");

router.get("/:id", async (req, res) => {
    const connection = await connectOracle();
    const result = await connection.execute(`SELECT * FROM users WHERE user_id = :id`, { id: req.params.id });

    if (result.rows.length > 0) {
        res.json({ user: result.rows[0] });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

module.exports = router;
