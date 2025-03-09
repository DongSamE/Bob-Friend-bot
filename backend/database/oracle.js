const oracledb = require("oracledb");

async function connectOracle() {
    try {
        return await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING
        });
    } catch (err) {
        console.error("❌ Oracle DB 연결 실패:", err);
    }
}

module.exports = { connectOracle };
