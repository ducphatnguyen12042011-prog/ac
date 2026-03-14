const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '50mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes } = req.body;
        let list = Array.isArray(processes) ? processes : [];
        
        // Từ khóa hack Roblox và chung
        const cheatKeys = ['cheat', 'hack', 'injector', 'exploit', 'aimbot', 'matcha', 'vape', 'executor'];
        let alerts = list.filter(name => cheatKeys.some(k => name.toLowerCase().includes(k)));

        // Lọc bỏ rác hệ thống để báo cáo gọn
        const junk = ['svchost', 'conhost', 'dllhost', 'wmiprvse', 'runtimebroker'];
        let cleanList = list.filter(name => !junk.includes(name.toLowerCase())).sort();

        let displayApps = cleanList.join(", ");
        if (displayApps.length > 1800) displayApps = displayApps.substring(0, 1800) + "...";

        const payload = {
            content: alerts.length > 0 ? `<@${ADMIN_ID}> 🔥 **PHÁT HIỆN HACK TRÊN MÁY: ${pc_name}**` : `📑 Báo cáo: ${pc_name}`,
            embeds: [{
                title: `Vận động viên: ${user}`,
                color: alerts.length > 0 ? 15548997 : 3066993,
                fields: [
                    { name: "⚠️ CẢNH BÁO", value: alerts.length > 0 ? `\`\`\`diff\n- ${alerts.join("\n- ")}\`\`\`` : "Chưa thấy hack" },
                    { name: "🎮 Ứng dụng", value: `\`\`\`${displayApps}\`\`\`` }
                ],
                timestamp: new Date()
            }]
        };

        await axios.post(DISCORD_WEBHOOK_URL, payload);
        res.status(200).send("OK");
    } catch (e) { res.status(200).send("OK"); }
});

app.listen(process.env.PORT || 3000);
