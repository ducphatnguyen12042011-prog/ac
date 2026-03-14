const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
app.use(express.json({ limit: '50mb' }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const ADMIN_ID = process.env.ADMIN_ID;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes, screenshot, status } = req.body;

        if (status === "offline") {
            await axios.post(DISCORD_WEBHOOK_URL, { content: `🔴 **${user}** đã thoát script.` });
            return res.status(200).send("OK");
        }

        // DANH SÁCH LOẠI BỎ (Mọi thứ bình thường sẽ biến mất ở đây)
        const ignoreList = [
            'svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse', 'taskhostw', 'explorer',
            'sihost', 'smartscreen', 'dwm', 'csrss', 'wininit', 'winlogon', 'lsass', 'spoolsv',
            'chrome', 'msedge', 'discord', 'zalo', 'steam', 'roblox', 'applicationframehost',
            'asus', 'glidex', 'armoury', 'rog', 'evkey', 'unikey', 'notepad', 'foxit', 'office',
            'search', 'shell', 'widgets', 'xbox', 'gamingservices', 'audiodg', 'fontdrvhost',
            'backgroundtaskhost', 'ctfmon', 'pwsh', 'powershell', 'cmd', 'services', 'idle', 
            'registry', 'vssvc', 'wlanext', 'wudfhost', 'useroobebroker', 'textinputhost',
            'startmenuexperiencehost', 'phoneexperiencehost', 'p2penhance', 'nissrv', 'msmpeng',
            'ms-teams', 'mpdefendercoreservice', 'midisrv', 'kidsafe', 'dtsapo4service', 
            'crossdeviceservice', 'crossdeviceresume', 'appactions', 'amdfendrsr', 'aksc'
        ];

        // Lọc lấy những thứ KHÔNG nằm trong danh sách trên
        let unknownApps = processes.filter(name => 
            !ignoreList.some(ignore => name.toLowerCase().includes(ignore.toLowerCase()))
        );

        // Từ khóa Hack
        const cheatKeys = ['cheat', 'hack', 'injector', 'exploit', 'aimbot', 'matcha', 'vape', 'comfort', 'app'];
        let alerts = processes.filter(name => cheatKeys.some(k => name.toLowerCase().includes(k)));

        const isDanger = alerts.length > 0 || unknownApps.length > 0;

        const embed = {
            title: isDanger ? "⚠️ PHÁT HIỆN TIẾN TRÌNH LẠ" : "✅ MÁY SẠCH",
            color: isDanger ? 15548997 : 3066993,
            fields: [
                { name: "👤 User", value: `\`${user}\``, inline: true },
                { name: "💻 PC", value: `\`${pc_name}\``, inline: true },
                { 
                    name: "🔍 Chỉ hiện cái lạ", 
                    value: unknownApps.length > 0 ? `\`\`\`diff\n- ${unknownApps.join("\n- ")}\`\`\`` : "\`Không có gì lạ\`" 
                }
            ],
            image: { url: 'attachment://screen.jpg' },
            footer: { text: "Trạng thái: Online" },
            timestamp: new Date()
        };

        const form = new FormData();
        if (isDanger) form.append('content', `<@${ADMIN_ID}>`);
        form.append('payload_json', JSON.stringify({ embeds: [embed] }));
        if (screenshot) form.append('file', Buffer.from(screenshot, 'base64'), { filename: 'screen.jpg' });

        await axios.post(DISCORD_WEBHOOK_URL, form, { headers: form.getHeaders(), timeout: 30000 });
        res.status(200).send("OK");
    } catch (e) { res.status(200).send("OK"); }
});

app.listen(process.env.PORT || 3000);
