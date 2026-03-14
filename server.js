const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
app.use(express.json({ limit: '50mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes, screenshot } = req.body;

        // DANH SÁCH AN TOÀN (Lọc cực mạnh)
        const safeList = [
            'svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse', 'taskhostw', 'explorer',
            'sihost', 'smartscreen', 'dwm', 'csrss', 'wininit', 'winlogon', 'lsass', 'spoolsv',
            'chrome', 'msedge', 'discord', 'zalo', 'steam', 'roblox', 'applicationframehost',
            'asus', 'glidex', 'armoury', 'rog', 'evkey', 'unikey', 'notepad', 'foxit', 'office',
            'search', 'shell', 'widgets', 'xbox', 'gamingservices', 'audiodg', 'fontdrvhost',
            'backgroundtaskhost', 'ctfmon', 'pwsh', 'powershell', 'cmd', 'services', 'idle', 'registry'
        ];

        // Lọc tiến trình lạ
        let unknownApps = processes.filter(name => 
            !safeList.some(safe => name.toLowerCase().includes(safe.toLowerCase()))
        );

        // Phát hiện hack
        const cheatKeys = ['cheat', 'hack', 'injector', 'exploit', 'aimbot', 'matcha', 'vape', 'comfort', 'app'];
        let alerts = processes.filter(name => cheatKeys.some(k => name.toLowerCase().includes(k)));

        const isDanger = alerts.length > 0 || unknownApps.length > 0;

        // Tạo cấu trúc Embed
        const embed = {
            title: isDanger ? "⚠️ CẢNH BÁO TIẾN TRÌNH LẠ" : "✅ HỆ THỐNG AN TOÀN",
            color: isDanger ? 15548997 : 3066993, // Đỏ nếu lạ, Xanh nếu sạch
            fields: [
                { name: "👤 Người dùng", value: `\`${user}\``, inline: true },
                { name: "💻 Máy tính", value: `\`${pc_name}\``, inline: true },
                { 
                    name: "🔍 Tiến trình nghi vấn/lạ", 
                    value: unknownApps.length > 0 ? `\`\`\`diff\n- ${unknownApps.join("\n- ")}\`\`\`` : "\`Không có\`" 
                }
            ],
            image: { url: 'attachment://screen.jpg' },
            footer: { text: "Giám sát vận động viên • " + new Date().toLocaleString('vi-VN') }
        };

        const form = new FormData();
        form.append('content', isDanger ? `<@${ADMIN_ID}>` : "");
        form.append('payload_json', JSON.stringify({ embeds: [embed] }));
        
        if (screenshot) {
            const buffer = Buffer.from(screenshot, 'base64');
            form.append('file', buffer, { filename: 'screen.jpg' });
        }

        await axios.post(DISCORD_WEBHOOK_URL, form, { headers: form.getHeaders(), timeout: 30000 });
        res.status(200).send("OK");
    } catch (e) { res.status(200).send("OK"); }
});

app.listen(process.env.PORT || 3000);
