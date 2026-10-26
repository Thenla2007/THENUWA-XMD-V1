const { cmd } = require('../command');
const config = require('../config');
const path = require('path');
const fs = require('fs');

const audioPath = path.join(__dirname, '../media/goku_owner.mp3');

cmd({
    pattern: 'owner',
    alias: ['dev', 'dila', 'bot'],
    react: '✅',
    desc: 'Get owner number',
    category: 'main',
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = '94763853448';
        const ownerName = 'Thenula Thisen';
        const botName = 'THENUVA X MD';
        const version = config.VERSION || '2.0.0 Beta';
        const ownerEmail = config.OWNER_EMAIL || 'dilamd@gmail.com';

        const cleanNumber = ownerNumber.replace(/[^0-9]/g, '');

        // Owner Contact Card
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
N:${ownerName};;;
ORG:${botName}
TITLE:Founder & Developer
TEL;TYPE=CELL,VOICE;waid=${cleanNumber}:+${cleanNumber}
EMAIL:${ownerEmail}
NOTE:Official contact card of ${botName}
END:VCARD`;

        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

        // Owner Details Caption
        const caption = `╭━━〔 *THENUVA X MD* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - ${ownerName}
┃◈┃• *Number* - ${ownerNumber}
┃◈┃• *Version* - ${version}
┃◈└───────────┈⊷
╰──────────────┈⊷

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛʜᴇɴᴜᴠᴀ x ᴍᴅ
© THENUVA X MD`;

        // Send Owner Image
        await conn.sendMessage(from, {
            image: {
                url: 'https://i.ibb.co/6JrfGTrG/temp-image.jpg'
            },
            caption,
            contextInfo: {
                mentionedJid: [`${cleanNumber}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: 'THENUVA X MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send Owner Audio if available
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: mek });
        }

    } catch (error) {
        console.error('[THENUVA X MD OWNER ERROR]', error);

        await conn.sendMessage(from, {
            text: `❌ Owner command error: ${error.message}`
        }, { quoted: mek });
    }
});
