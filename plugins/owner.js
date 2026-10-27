const { cmd } = require('../command');
const config = require('../config');
const path = require('path');
const fs = require('fs');

const audioPath = path.join(__dirname, '../media/goku_owner.mp3');

cmd({
    pattern: 'owner',
    alias: ['dev', 'dila', 'bot'],
    react: '✅',
    desc: 'Get owner details',
    category: 'main',
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = '94763853448';
        const ownerName = 'Thenula Thisan';
        const botName = 'THENUWA X MD';
        const version = config.VERSION || '2.0.0 Beta';
        const ownerEmail =
            config.OWNER_EMAIL || 'thenulathisan130@gmail.com';

        const profileImageUrl =
            'https://files.catbox.moe/xwpeh6.jpg';

        const ownerImageUrl =
            'https://files.catbox.moe/y300u3.png';

        const cleanNumber = ownerNumber.replace(/[^0-9]/g, '');
        const ownerChatUrl = `https://wa.me/${cleanNumber}`;

        // Owner Contact Card
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
N:${ownerName};;;
ORG:${botName}
TITLE:Owner & Developer
TEL;TYPE=CELL,VOICE;waid=${cleanNumber}:+${cleanNumber}
EMAIL:${ownerEmail}
PHOTO;VALUE=URI:${profileImageUrl}
NOTE:Owner of ${botName}
END:VCARD`;

        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

        // Owner Details
        const caption = `╭━━〔 *${botName}* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - ${ownerName}
┃◈┃• *Number* - ${ownerNumber}
┃◈┃• *Version* - ${version}
┃◈└───────────┈⊷
╰──────────────┈⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇɴᴜᴠᴀ x ᴍᴅ`;

        // Owner Image + WhatsApp URL Button
        await conn.sendMessage(from, {
            image: { url: ownerImageUrl },
            caption,
            footer: `© ${botName}`,
            templateButtons: [
                {
                    text: '💬 CHAT ON WHATSAPP',
                    url: ownerChatUrl
                }
            ],
            contextInfo: {
                mentionedJid: [`${cleanNumber}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363432592026043@newsletter',
                    newsletterName: botName,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Optional Owner Audio
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: mek });
        }

    } catch (error) {
        console.error('[THENUWA X MD OWNER ERROR]', error);

        await conn.sendMessage(from, {
            text: `❌ Owner command error: ${error.message}`
        }, { quoted: mek });
    }
});
