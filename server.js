const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '10mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        
        // 1. Lọc lấy danh sách tên, bỏ trùng
        let allNames = [...new Set(processes.map(p => p.Name))].sort();

        // 2. Tìm kiếm gian lận (Hack/Cheat/Injector)
        const dangerKeywords = ['cheat', 'hack', 'injector', 'vape', 'aimbot', 'engine', 'artmoney', 'lagswitch'];
        let alerts = allNames.filter(name => 
            dangerKeywords.some(kw => name.toLowerCase().includes(kw))
        );

        // 3. Loại bỏ bớt các tiến trình hệ thống nhàm chán để báo cáo gọn hơn
        const systemStuff = ['svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse', 'taskhostw', 'backgroundtaskhost', 'fontdrvhost'];
        let cleanList = allNames.filter(name => !systemStuff.includes(name.toLowerCase()));

        // Gửi tin nhắn
        const payload = {
            content: alerts.length > 0 ? `<@${ADMIN_ID}> ⚠️ **CẢNH BÁO NGUY HIỂM!**` : `📑 **Báo cáo máy: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: alerts.length > 0 ? 15158332 : 3066993, // Đỏ nếu có nghi vấn, Xanh nếu sạch
                fields: [
                    { 
                        name: "❌ NGHI VẤN HACK/CHEAT", 
                        value: alerts.length > 0 ? `\`\`\`diff\n- ${alerts.join("\n- ")}\`\`\`` : "`Sạch`", 
                        inline: false 
                    },
                    { 
                        name: "🎮 ỨNG DỤNG ĐANG CHẠY", 
                        value: `\`\`\`${cleanList.slice(0, 50).join(", ")}${cleanList.length > 50 ? "..." : ""}\`\`\``, 
                        inline: false 
                    }
                ],
                footer: { text: `Tổng cộng ${allNames.length} tiến trình đang chạy.` },
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (error) {
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server gọn gàng đã sẵn sàng!`));
