require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { connectDB } = require("./database/mongo");
const { connectOracle } = require("./database/oracle");

const app = express();
const PORT = process.env.PORT || 3000;

// EJS 설정
app.set("view engine", "ejs");
app.use(express.static("public"));

// 세션 설정
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// DB 연결
connectDB();
connectOracle();

// API 라우트 설정
app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/recommendation", require("./routes/recommendation"));

// 서버 실행
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));