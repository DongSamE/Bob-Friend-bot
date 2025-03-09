require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const oracledb = require("oracledb");
const Menu = require("../models/Menu");
const QueryLog = require("../models/QueryLog");
const { connectOracle } = require("../database/oracle");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch(err => console.error("❌ MongoDB 연결 오류:", err));

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith("!메뉴추천")) {
        let 추천메뉴 = await Menu.aggregate([{ $sample: { size: 3 } }]);
        let 추천리스트 = 추천메뉴.map(m => m.이름);

        await QueryLog.create({
            userId: message.author.id,
            query: message.content,
            recommended: 추천리스트
        });

        const connection = await connectOracle();
        const userResult = await connection.execute(`SELECT username FROM users WHERE user_id = :id`, { id: message.author.id });

        let username = userResult.rows.length ? userResult.rows[0][0] : "Unknown User";
        message.reply(`${username}님, 오늘의 추천 메뉴: ${추천리스트.join(", ")}`);
    }
});

// 봇 실행
client.login(process.env.DISCORD_BOT_TOKEN);
