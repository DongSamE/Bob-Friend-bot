const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.GPT_API_KEY,
    basePath: "https://api.openai.com/v1",
}));

// JSON 파일 불러오기
const Menu = require("../models/Menu");

// MongoDB에서 메뉴 가져오기
const availableMenu = await Menu.find({
    카테고리: category !== "전체" ? category : { $exists: true },
    태그: filters.length > 0 ? { $in: filters } : { $exists: true }
});

// 🔹 카테고리 & 태그 리스트 정의
const CATEGORY_LIST = Object.keys(DELIVERY_MENU);
const TAG_LIST = [
    "매운", "담백한", "바삭한", "부드러운", "달달한",
    "국물요리", "볶음요리", "튀김", "구이", "고기류", "면류", "치즈"
];

module.exports = {
    name: '메뉴추천',
    description: '배달 가능한 저녁 메뉴를 추천합니다! 특정 카테고리나 태그를 입력하거나 자연어로 요청할 수 있습니다.',
    async execute(message, args) {
        const userInput = args.join(" ");

        // ✅ 1️⃣ `help` 명령어 실행 시 사용법 출력
        if (userInput.toLowerCase() === "help") {
            message.reply(
                "밥송수 봇 - 메뉴 추천 도움말\n\n" +
                "📌 기본 사용법: `!메뉴추천 [카테고리] [태그]` 또는 자연어 입력 가능\n" +
                "🔹 카테고리 목록: " + CATEGORY_LIST.join(", ") + "\n" +
                "🔹 태그 목록: " + TAG_LIST.join(", ") + "\n\n" +
                "✅ 예시:\n" +
                "!메뉴추천 → 전체 메뉴에서 추천\n" +
                "!메뉴추천 한식 → 한식 중에서 추천\n" +
                "!메뉴추천 한식 매운 → 한식 중 매운 음식 추천\n" +
                "!메뉴추천 오늘 좀 기분이 다운되는데? → 감정 분석 후 맞춤 메뉴 추천"
            );
            return;
        }

        // ✅ 2️⃣ 카테고리 & 태그 필터링 적용
        let category = "전체";
        let filters = [];
        let availableMenu = [];

        const foundCategory = CATEGORY_LIST.find(cat => userInput.includes(cat));
        if (foundCategory) {
            category = foundCategory;
        }

        const foundTags = TAG_LIST.filter(tag => userInput.includes(tag));
        if (foundTags.length > 0) {
            filters = [...foundTags];
        }

        // ✅ 3️⃣ 명령어 기반 추천 (카테고리 & 태그 필터 적용)
        if (foundCategory || foundTags.length > 0) {
            if (category !== "전체") {
                availableMenu = DELIVERY_MENU[category].filter(food =>
                    filters.length === 0 || filters.some(tag => food.태그.includes(tag))
                );
            } else {
                availableMenu = Object.values(DELIVERY_MENU)
                    .flat()
                    .filter(food => filters.length === 0 || filters.some(tag => food.태그.includes(tag)));
            }

            if (availableMenu.length === 0) {
                message.reply("해당 조건에 맞는 배달 음식이 없습니다. 다른 키워드를 시도해보세요.");
                return;
            }

            // 첫 문장 추가 (카테고리 입력 시 반응)
            let firstSentence = foundCategory ? `${foundCategory}이(가) 먹고 싶구나!` : "좋아! 이런 메뉴는 어때?";
            const recommendedMenus = availableMenu.map(food => food.이름).slice(0, 3);
            message.reply(`${firstSentence}\n\n추천 메뉴:\n1. ${recommendedMenus[0]}\n2. ${recommendedMenus[1]}\n3. ${recommendedMenus[2]}`);
            return;
        }

        // ✅ 4️⃣ 자연어 입력 분석 → 감정에 맞는 추천 + 이유 제공
        const prompt = `
        친구가 다음과 같은 메시지를 입력했어요: ${userInput}
        친구의 기분이나 상태를 분석하고, 이에 맞는 배달 메뉴를 3가지 추천해주세요.
        추천하는 이유를 짧게 한 문장으로 추가하고, 이후에는 설명 없이 음식 이름만 1, 2, 3 번호 형식으로 나열해주세요.
        메뉴 리스트: ${Object.values(DELIVERY_MENU).flat().map(food => food.이름).join(", ")}
        대답 형식:
        오늘 기분이 안 좋구나. 따뜻한 국물이 위로가 될 거야.\n\n추천 메뉴:\n1. 김치찌개\n2. 육개장\n3. 삼계탕
        `;

        try {
            const response = await openai.createChatCompletion({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: "너는 배달 음식 추천 로봇 '밥송수봇'이야. 감정에 대한 반응과 이유를 먼저 말한 후, 추천 메뉴는 1, 2, 3 형식으로 나열해야 해." },
                    { role: 'user', content: prompt }
                ]
            });

            if (response.data && response.data.choices) {
                const recommendation = response.data.choices[0].message.content;
                message.reply(recommendation);
            } else {
                throw new Error("GPT 응답 데이터가 비어 있습니다.");
            }
        } catch (error) {
            console.error("GPT 요청 실패:", error.response ? error.response.data : error.message);
            message.reply("GPT API 오류로 인해 메뉴 추천이 불가능합니다.");
        }
    }
};
