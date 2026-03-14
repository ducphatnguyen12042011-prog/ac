const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();

// Mở rộng giới hạn nhận dữ liệu lên tối đa
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

app.post('/report', async (req, res) => {
    try {
        const { pc_name, user, processes, screenshot } = req.body;
        if (!DISCORD_WEBHOOK_URL) return res.status(500).send("No Webhook");

        // Lọc danh sách app cực gọn
        const junk = ['svchost', 'conhost', 'dllhost', 'runtimebroker', 'wmiprvse'];
        let cleanList = [...new Set(processes)].filter(n => !junk.includes(n.toLowerCase())).sort();
        
        const message = `📸 **BÁO CÁO: ${pc_name} (${user})**\n` +
                        `🎮 **App:** \`${cleanList.join(", ").substring(0, 1000)}\``;

        const form = new FormData();
        form.append('content', message);
        
        if (screenshot) {
            const buffer = Buffer.from(screenshot, 'base64');
            // Gửi ảnh dưới dạng file đính kèm
            form.append('file', buffer, { filename: 'screen.jpg' });
        }

        // Gửi tới Discord với thời gian chờ (timeout) dài hơn
        await axios.post(DISCORD_WEBHOOK_URL, form, { 
            headers: form.getHeaders(),
            timeout: 30000 
        });

        res.status(200).send("OK");
    } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error.message);
        // Trả về 200 thay vì 500 để PowerShell không báo lỗi đỏ
        res.status(200).send("Ignored Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Anti-Cheat Server Ready"));
