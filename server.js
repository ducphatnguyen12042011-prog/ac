const express = require('express');
const axios = require('axios');
const app = express();

// Tăng giới hạn tối đa để không bao giờ lỗi 500 do dung lượng
app.use(express.json({ limit: '100mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("No Webhook");

        // Gom danh sách tên và loại bỏ các tiến trình hệ thống cực rác
        const junk = ['svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse', 'taskhostw'];
        let rawList = Array.isArray(processes) ? processes.map(p => p.Name || p) : [];
        let cleanList = [...new Set(rawList)]
            .filter(name => name && !junk.includes(name.toLowerCase()))
            .sort();

        // Cắt gọn danh sách để Discord chấp nhận (Dưới 2000 ký tự)
        let listString = cleanList.join(", ");
        if (listString.length > 1900) listString = listString.substring(0, 1900) + "...";

        const payload = {
            content: `<@${ADMIN_ID}> 📑 **BÁO CÁO MÁY: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: 3066993,
                description: `**Danh sách phần mềm:**\n\`\`\`${listString || 'Đang quét...'}\`\`\``,
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Lỗi:", error.message);
        res.status(200).send("OK"); // Trả về 200 để PowerShell không hiện lỗi đỏ nữa
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live"));
