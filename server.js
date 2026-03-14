const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '50mb' })); // Cho phép nhận dữ liệu lớn

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("Chưa cấu hình Webhook");

        // Gom danh sách tên app, xóa trùng và sắp xếp
        let appList = [...new Set(processes.map(p => p.Name))].sort().join(", ");
        
        // Discord giới hạn 2000 ký tự mỗi tin nhắn, mình cắt ở 1800 cho an toàn
        if (appList.length > 1800) {
            appList = appList.substring(0, 1800) + "... (Danh sách quá dài, đã cắt bớt)";
        }

        const payload = {
            content: `<@${ADMIN_ID}> 📑 **BÁO CÁO MÁY: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: 3447003,
                description: `**Ứng dụng đang chạy:**\n\`\`\`${appList}\`\`\``,
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Lỗi gửi Discord:", error.message);
        res.status(500).send("Lỗi gửi tin nhắn");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
