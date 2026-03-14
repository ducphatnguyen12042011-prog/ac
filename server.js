const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '10mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        
        // 1. Lọc danh sách: Bỏ các tiến trình hệ thống nhàm chán
        const systemExclude = [
            'svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse', 'taskhostw', 
            'backgroundtaskhost', 'fontdrvhost', 'sihost', 'smartscreen', 'smss', 
            'services', 'lsass', 'wininit', 'winlogon', 'csrss', 'dwm', 'explorer'
        ];
        
        let allNames = [...new Set(processes.map(p => p.Name))];
        let filteredApps = allNames.filter(name => !systemExclude.includes(name.toLowerCase())).sort();

        // 2. Tìm kiếm từ khóa Hack/Cheat
        const dangerKeywords = ['cheat', 'hack', 'injector', 'vape', 'aimbot', 'engine', 'artmoney'];
        let alerts = allNames.filter(name => 
            dangerKeywords.some(kw => name.toLowerCase().includes(kw))
        );

        // 3. Tạo nội dung hiển thị gọn gàng
        const payload = {
            content: alerts.length > 0 ? `<@${ADMIN_ID}> ⚠️ **CẢNH BÁO PHÁT HIỆN NGHI VẤN!**` : `📑 **BÁO CÁO MÁY: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: alerts.length > 0 ? 15158332 : 3066993, // Đỏ nếu có nghi vấn, Xanh nếu sạch
                fields: [
                    { 
                        name: "❌ TIẾN TRÌNH NGHI VẤN", 
                        value: alerts.length > 0 ? `\`\`\`diff\n- ${alerts.join("\n- ")}\`\`\`` : "`Sạch`", 
                        inline: false 
                    },
                    { 
                        name: "🎮 ỨNG DỤNG ĐANG CHẠY (Đã rút gọn)", 
                        value: filteredApps.length > 0 ? `\`\`\`${filteredApps.join(", ")}\`\`\`` : "`Chỉ có tiến trình hệ thống`", 
                        inline: false 
                    }
                ],
                footer: { text: `Đã lọc từ ${allNames.length} tiến trình gốc.` },
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
app.listen(PORT, () => console.log(`Server Online`));
