const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '50mb' })); 

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("No Webhook");

        // Lấy tên app, xóa trùng, sắp xếp và gom lại thành đoạn văn
        let appList = [...new Set(processes.map(p => p.Name))].sort().join(", ");
        
        // Cắt bớt nếu quá dài để tránh lỗi Discord (Giới hạn 2000 ký tự cho an toàn)
        if (appList.length > 1900) {
            appList = appList.substring(0, 1900) + "... (còn tiếp)";
        }

        const payload = {
            content: `<@${ADMIN_ID}> 📑 **BÁO CÁO MÁY: ${pc_name}**`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: 3447003,
                description: `**Danh sách ứng dụng:**\n\`\`\`${appList}\`\`\``,
                footer: { text: "Monitoring Active" },
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Lỗi gửi Discord:", error.message);
        res.status(500).send("Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));
