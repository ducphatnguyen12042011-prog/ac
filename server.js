const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn nhận dữ liệu

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("No Webhook");

        // Lấy danh sách tên tiến trình và lọc bỏ trùng lặp, sắp xếp cho gọn
        let appList = [...new Set(processes.map(p => p.Name))].sort().join(", ");
        
        // Nếu danh sách quá dài (Discord giới hạn embed 4096 ký tự), ta cắt bớt
        if (appList.length > 3800) {
            appList = appList.substring(0, 3800) + "... (và nhiều ứng dụng khác)";
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
        console.error("Lỗi:", error.response ? error.response.data : error.message);
        res.status(500).send("Internal Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
