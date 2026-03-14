const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '10mb' })); 

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("No Webhook Configured");

        // Lấy tên app, lọc trùng, xóa khoảng trắng và sắp xếp
        let list = [...new Set(processes.map(p => p.Name))].sort();
        
        // Chia danh sách thành các đoạn nhỏ để Discord không bị quá tải
        let chunk = list.join(", ");
        if (chunk.length > 1800) {
            chunk = chunk.substring(0, 1800) + "... (Danh sách quá dài)";
        }

        const payload = {
            content: `<@${ADMIN_ID}> 📑 **BÁO CÁO MÁY: ${pc_name}**`,
            embeds: [{
                title: `Người dùng: ${user}`,
                color: 3447003,
                description: `**Ứng dụng đang chạy:**\n\`\`\`${chunk}\`\`\``,
                footer: { text: `Tổng cộng: ${list.length} tiến trình` },
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Lỗi gửi Discord:", error.message);
        res.status(500).send("Discord Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Online` || 3000));
