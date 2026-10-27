const { cmd } = require('../command');
const config = require('../config');
const path = require('path');
const fs = require('fs');

const audioPath = path.join(__dirname, '../media/goku_owner.mp3');

cmd({
    pattern: 'owner',
    alias: ['dev', 'dila', 'bot'],
    desc: 'Get owner details',
    category: 'main',
    react: '👤',
    filename: __filename
},
async (conn, mek, m, {
    from, sender, senderNumber, pushname, isGroup, reply
}) => {
    try {
        // ═══════════════════════════════════════
        // OWNER DETAILS
        // ═══════════════════════════════════════
        const ownerNumber = '94763853448';
        const ownerName = 'Thenula Thisan';
        const botName = config.BOT_NAME || 'THENUWA X MD';
        const version = config.VERSION || '3.0.0 BETA';
        const ownerEmail =
            config.OWNER_EMAIL || 'thenulathisan130@gmail.com';

        const profileImageUrl =
            'https://files.catbox.moe/xwpeh6.jpg';

        const ownerImageUrl =
            'https://files.catbox.moe/y300u3.png';

        const ownerChatUrl = `https://wa.me/${ownerNumber}`;
        const cleanNumber = ownerNumber.replace(/[^0-9]/g, '');

        // ═══════════════════════════════════════
        // CONTACT CARD
        // ═══════════════════════════════════════
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

        // ═══════════════════════════════════════
        // OWNER CAPTION
        // ═══════════════════════════════════════
        const userName = pushname || senderNumber || 'User';

        const caption = `
╭━━〔 *${botName}* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃ 👤 *OWNER DETAILS*
┃◈┃
┃◈┃ • *Name:* ${ownerName}
┃◈┃ • *Number:* ${ownerNumber}
┃◈┃ • *Email:* ${ownerEmail}
┃◈┃ • *Version:* ${version}
┃◈┃ • *Requested by:* ${userName}
┃◈└───────────┈⊷
╰──────────────┈⊷

💬 *CHAT WITH OWNER*
${ownerChatUrl}

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${botName}`;

        // ═══════════════════════════════════════
        // CONTEXT INFO — SAME STYLE AS ALIVE.JS
        // ═══════════════════════════════════════
        const contextInfo = {
            mentionedJid: sender ? [sender] : [],
            forwardingScore: 999,
            isForwarded: true
        };

        if (!isGroup) {
            contextInfo.forwardedNewsletterMessageInfo = {
                newsletterJid: '120363409414874042@newsletter',
                newsletterName: botName,
                serverMessageId: 143
            };
        }

        // ═══════════════════════════════════════
        // BUTTONS — SAME STRUCTURE AS ALIVE.JS
        // ═══════════════════════════════════════
        const buttonEnabled =
            String(config.BUTTON).toLowerCase() === 'true';

        if (buttonEnabled) {
            await conn.sendMessage(from, {
                image: { url: ownerImageUrl },
                caption,
                footer: `© ${botName}`,
                ai: !isGroup,
                buttons: [
                    {
                        buttonId: '.alive',
                        buttonText: {
                            displayText: '🟢 Alive'
                        },
                        type: 1
                    },
                    {
                        buttonId: '.menu',
                        buttonText: {
                            displayText: '📋 Menu'
                        },
                        type: 1
                    }
                ],
                headerType: 1,
                contextInfo
            }, { quoted: mek });

        } else {
            await conn.sendMessage(from, {
                image: { url: ownerImageUrl },
                caption,
                ai: !isGroup,
                contextInfo
            }, { quoted: mek });
        }

        // ═══════════════════════════════════════
        // OPTIONAL AUDIO
        // ═══════════════════════════════════════
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: mek });
        }

    } catch (error) {
        console.error('[THENUWA X MD OWNER ERROR]', error);

        const errorText =
            `❌ Owner command error: ${error.message}`;

        try {
            await conn.sendMessage(from, {
                text: errorText,
                ai: !isGroup,
                contextInfo: {
                    mentionedJid: sender ? [sender] : []
                }
            }, { quoted: mek });
        } catch (sendError) {
            console.error('[OWNER ERROR REPLY FAILED]', sendError);

            if (typeof reply === 'function') {
                await reply(errorText);
            }
        }
    }
});
