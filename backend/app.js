require('dotenv').config({ path: __dirname + '/.env' });  // bot 폴더 안에 있는 .env 로드
console.log("✅ 토큰 로드 확인:", process.env.DISCORD_BOT_TOKEN); // 디버깅용

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,  // 멤버 정보 사용 가능하도록 추가
        GatewayIntentBits.GuildPresences // Presence 정보 사용 가능하도록 추가
    ]
});

// 명령어 로드
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// 메시지 이벤트 처리
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    try {
        await client.commands.get(commandName).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply("❌ 명령어 실행 중 오류가 발생했어요!");
    }
});

// 봇 로그인
client.login(process.env.DISCORD_BOT_TOKEN);
