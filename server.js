const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// --- LẤY TỪ ENVIRONMENT CỦA RENDER ---
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        
        if (!DISCORD_WEBHOOK_URL) {
            console.error("LỖI: Chưa có Webhook URL trong Environment!");
            return res.status(500).send("Missing Webhook");
        }

        // Chuyển danh sách object processes thành một chuỗi tên ứng dụng
        const allApps = processes.map(p => p.Name).filter(n => n).join(", ");

        const payload = {
            content: `<@${ADMIN_ID}> 📑 **BÁO CÁO TOÀN BỘ TIẾN TRÌNH: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: 3447003, // Màu xanh dương chuyên nghiệp
                description: `**Danh sách ứng dụng đang chạy:**\n\`\`\`${allApps.substring(0, 3800)}\`\`\``, 
                footer: { text: "Hệ thống giám sát giải đấu - Live Monitor" },
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        console.log(`Đã gửi báo cáo cho máy: ${pc_name}`);
        res.status(200).send("OK");

    } catch (error) {
        console.error("Lỗi gửi Discord:", error.message);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
