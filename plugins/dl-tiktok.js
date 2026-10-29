// ============================================================
// 🎵 TIKTOK DOWNLOADER — LUXALGO MD
// BUTTON=true  → Button selector
// BUTTON=false → Number selector (reply required)
// Simple captions on downloaded media
// ============================================================
const config = require('../config');
const { cmd } = require('../command');
const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const axios = require('axios');

const TT_THUMB_DEFAULT = 'https://i.postimg.cc/Y9VQtfYS/file-000000006b04821189e40920bd7a1471.png';
const BOT_NAME = 'LUXALGO';

if (!global.TT_PENDING) global.TT_PENDING = new Map();

// ============================================================
// Helpers
// ============================================================
function extractMsgId(result) {
    if (!result) return null;
    if (typeof result === 'string') return result;
    if (result.key?.id) return result.key.id;
    if (result.id) return result.id;
    return null;
}

function shortTitle(title) {
    return (title || 'TikTok').slice(0, 50).replace(/\n/g, ' ');
}

// ============================================================
// Process Download
// ============================================================
async function processTTDownload(conn, chatID, receivedMsg, num, data) {
    try {
        const { d, videoUrl, audioUrl, hdUrl, images } = data;

        if (num < 1 || num > 4) {
            await conn.sendMessage(chatID, {
                text: `❌ *Invalid selection!*`
            }, { quoted: receivedMsg });
            return;
        }

        // Validate
        if (num === 1 && !videoUrl) {
            return await conn.sendMessage(chatID, {
                text: '❌ *Video not available.*'
            }, { quoted: receivedMsg });
        }
        if (num === 2 && !hdUrl) {
            return await conn.sendMessage(chatID, {
                text: '❌ *HD video not available.*'
            }, { quoted: receivedMsg });
        }
        if (num === 3 && !audioUrl) {
            return await conn.sendMessage(chatID, {
                text: '❌ *Audio not available.*'
            }, { quoted: receivedMsg });
        }
        if (num === 4 && (!images || images.length === 0)) {
            return await conn.sendMessage(chatID, {
                text: '❌ *This post is not a slideshow.*'
            }, { quoted: receivedMsg });
        }

        const modeText = num === 1 ? '🎬 Video'
                       : num === 2 ? '🎬 Video HD'
                       : num === 3 ? '🎵 Audio'
                       : '🖼️ Images';

        await conn.sendMessage(chatID, { react: { text: '⬇️', key: receivedMsg.key } });
        await conn.sendMessage(chatID, {
            text: `⏳ *Downloading ${modeText}...*`
        }, { quoted: receivedMsg });

        const author = d.author?.nickname || 'Unknown';
        const username = d.author?.unique_id || 'user';
        const title = shortTitle(d.title);

        // ⭐ Simple caption
        const simpleCaption = `${title}\n> © Powered by ${BOT_NAME}`;

        if (num === 1 || num === 2) {
            const url = num === 1 ? videoUrl : hdUrl;

            // Send video
            await conn.sendMessage(chatID, {
                video: { url: url },
                mimetype: 'video/mp4',
                caption: simpleCaption
            }, { quoted: receivedMsg });

            // Send as document
            await conn.sendMessage(chatID, {
                document: { url: url },
                mimetype: 'video/mp4',
                fileName: `tiktok_${username}_${Date.now()}.mp4`,
                caption: simpleCaption
            }, { quoted: receivedMsg });

        } else if (num === 3) {
            // Audio
            await conn.sendMessage(chatID, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: receivedMsg });

            await conn.sendMessage(chatID, {
                document: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `tiktok_${username}_${Date.now()}.mp3`,
                caption: simpleCaption
            }, { quoted: receivedMsg });

        } else if (num === 4) {
            // Images
            for (let i = 0; i < images.length && i < 10; i++) {
                try {
                    await conn.sendMessage(chatID, {
                        image: { url: images[i] },
                        caption: i === 0 ? simpleCaption : ''
                    }, { quoted: receivedMsg });
                } catch (imgErr) {
                    console.log(`⚠️ Image ${i + 1} failed:`, imgErr.message);
                }
            }
        }

        await conn.sendMessage(chatID, { react: { text: '✅', key: receivedMsg.key } });
        console.log(`✅ TikTok ${modeText} sent`);

    } catch (e) {
        console.error('❌ processTTDownload error:', e.message);
        try {
            await conn.sendMessage(chatID, {
                text: `❌ *Download failed!*\n\n> ${e.message.slice(0, 200)}`
            }, { quoted: receivedMsg });
        } catch (_) {}
    }
}

// ============================================================
// Send Button Selector
// ============================================================
async function sendButtonSelector(conn, from, mek, d, videoUrl, audioUrl, hdUrl, images) {
    const imgUrl = d.cover || d.origin_cover || TT_THUMB_DEFAULT;

    const author = d.author?.nickname || 'Unknown';
    const username = d.author?.unique_id || 'user';
    const title = d.title || 'TikTok Video';

    // Build rows
    const rows = [];
    if (videoUrl) {
        rows.push({ header: '🎬', title: 'Video (No Watermark)', description: 'Standard MP4', id: 'tt_1' });
    }
    if (hdUrl) {
        rows.push({ header: '🎥', title: 'Video HD', description: 'High quality MP4', id: 'tt_2' });
    }
    if (audioUrl) {
        rows.push({ header: '🎵', title: 'Audio (MP3)', description: 'Audio only', id: 'tt_3' });
    }
    if (images && images.length > 0) {
        rows.push({ header: '🖼️', title: `Images (${images.length})`, description: 'Slideshow images', id: 'tt_4' });
    }

    const caption = `🎵 *LUXALGO TIKTOK DOWNLOADER*

╭──────────────
┃👤┃ *User* : *${author}*
┃🏷️┃ *Username* : @${username}
┃📖┃ *Title* : ${title.slice(0, 80)}
┃👍┃ *Likes* : *${d.digg_count || 0}*
┃💬┃ *Comments* : *${d.comment_count || 0}*
┃🔁┃ *Shares* : *${d.share_count || 0}*
╰──────────────

📌 *Tap an option below* ⤵️

> © Powered by ${BOT_NAME}`;

    let media;
    try {
        media = await prepareWAMessageMedia(
            { image: { url: imgUrl } },
            { upload: conn.waUploadToServer }
        );
    } catch (e) {
        console.error('⚠️ Media failed:', e.message);
    }

    const msg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                interactiveMessage: {
                    body: { text: caption },
                    footer: { text: `⚡ ${BOT_NAME} MD` },
                    header: media ? {
                        title: '', hasMediaAttachment: true, imageMessage: media.imageMessage
                    } : {
                        title: '', hasMediaAttachment: false
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '🎵 SELECT FORMAT',
                                sections: [{
                                    title: '📥 Download Options',
                                    rows
                                }]
                            })
                        }],
                        messageParamsJson: ''
                    },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363409414874042@newsletter',
                            newsletterName: `${BOT_NAME} MD`,
                            serverMessageId: 143
                        }
                    }
                }
            }
        }
    };

    return await conn.relayMessage(from, msg, { quoted: mek });
}

// ============================================================
// 🎵 .tiktok COMMAND
// ============================================================
cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tk", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com") && !q.includes("vt.tiktok") && !q.includes("vm.tiktok"))
            return reply("❌ Invalid TikTok link.");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
        console.log(`📤 TikTok: ${q}`);

        const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(q)}&hd=1`;
        const { data } = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 30000
        });

        if (data.code !== 0 || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply(`Failed: ${data.msg || "Unknown error"}`);
        }

        const d = data.data;
        const videoUrl = d.play || null;
        const hdUrl = d.hdplay || null;
        const audioUrl = d.music || null;
        const images = d.images || [];

        if (!videoUrl && !hdUrl && images.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ No downloadable content found.");
        }

        const buttonEnabled = String(config.BUTTON).toLowerCase() === 'true';
        let msgId = null;

        if (buttonEnabled) {
            // ⭐ BUTTON MODE
            const result = await sendButtonSelector(conn, from, mek, d, videoUrl, audioUrl, hdUrl, images);
            msgId = extractMsgId(result);
            console.log(`✅ TT button selector sent — ID: ${msgId}`);

        } else {
            // ⭐ NUMBER MODE
            let optionsList = '';
            if (videoUrl) optionsList += `*1.* 🎬 *Video (No Watermark)*\n`;
            if (hdUrl)    optionsList += `*2.* 🎥 *Video HD*\n`;
            if (audioUrl) optionsList += `*3.* 🎵 *Audio (MP3)*\n`;
            if (images.length > 0) optionsList += `*4.* 🖼️ *Images (${images.length})*\n`;

            const selectMsg = `🎵 *LUXALGO TIKTOK DOWNLOADER*

╭──────────────
┃👤┃ *User* : *${d.author?.nickname || 'Unknown'}*
┃🏷️┃ *Username* : @${d.author?.unique_id || 'user'}
┃📖┃ *Title* : ${(d.title || 'TikTok Video').slice(0, 80)}
┃👍┃ *Likes* : *${d.digg_count || 0}*
┃💬┃ *Comments* : *${d.comment_count || 0}*
┃🔁┃ *Shares* : *${d.share_count || 0}*
╰──────────────

📊 *Choose an option:*

${optionsList}
💬 *Reply to this message with a number*
🔄 *You can select multiple options!*

> © Powered by ${BOT_NAME}`;

            const imgUrl = d.cover || d.origin_cover || TT_THUMB_DEFAULT;

            const sentMsg = await conn.sendMessage(from, {
                image: { url: imgUrl },
                caption: selectMsg,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: mek });

            msgId = sentMsg.key.id;
            console.log(`📝 TT number selector sent — ID: ${msgId}`);
        }

        // Save pending
        if (msgId) {
            global.TT_PENDING.set(`${from}|${msgId}`, {
                d,
                videoUrl,
                hdUrl,
                audioUrl,
                images,
                chatId: from,
                messageID: msgId,
                timestamp: Date.now(),
                expires: Date.now() + 5 * 60 * 1000,
                mode: buttonEnabled ? 'button' : 'number',
                processing: new Set()
            });

            setTimeout(() => {
                const key = `${from}|${msgId}`;
                const p = global.TT_PENDING.get(key);
                if (p && p.messageID === msgId) {
                    global.TT_PENDING.delete(key);
                    console.log(`⏰ TT pending expired: ${key}`);
                }
            }, 5 * 60 * 1000);
        }

        await conn.sendMessage(from, { react: { text: '🔢', key: mek.key } });

    } catch (e) {
        console.error("❌ TikTok error:", e.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *Error:* ${e.message.slice(0, 200)}`);
    }
});

// ============================================================
// 🎯 BODY HANDLER — Numbers + Button clicks
// ============================================================
cmd({
    pattern: 'ttcatch',
    dontAddCommandList: true,
    on: 'body'
},
async (conn, mek, m, { from, body }) => {
    try {
        const text = (body || '').trim();
        if (!text) return;

        // Match "1"-"4" or "tt_1"-"tt_4"
        let num = null;
        if (/^[1-4]$/.test(text)) {
            num = parseInt(text);
        } else if (/^tt_[1-4]$/i.test(text)) {
            num = parseInt(text.replace(/^tt_/i, ''));
        }

        if (!num) return;

        // Detect button click
        const isButtonClick = !!(
            mek.message?.interactiveResponseMessage ||
            mek.message?.listResponseMessage ||
            mek.message?.buttonsResponseMessage
        );

        const quotedId = mek.message?.extendedTextMessage?.contextInfo?.stanzaId;

        // Lookup pending
        let pending = null;
        let lookupKey = null;

        if (isButtonClick) {
            if (quotedId) {
                lookupKey = `${from}|${quotedId}`;
                pending = global.TT_PENDING.get(lookupKey);
            }
            if (!pending) {
                for (const [k, v] of global.TT_PENDING.entries()) {
                    if (k.startsWith(`${from}|`) && v.mode === 'button') {
                        pending = v;
                        lookupKey = k;
                        break;
                    }
                }
            }
        } else {
            if (!quotedId) return;
            lookupKey = `${from}|${quotedId}`;
            pending = global.TT_PENDING.get(lookupKey);
        }

        if (!pending) return;

        // Expiry
        if (Date.now() > pending.expires) {
            global.TT_PENDING.delete(lookupKey);
            return;
        }

        // Already processing?
        if (pending.processing.has(num)) {
            await conn.sendMessage(from, {
                text: `⏳ *Option ${num} is already downloading...*`
            }, { quoted: mek });
            return;
        }

        pending.processing.add(num);

        console.log(`🎵 TikTok selection: ${num}`);

        try {
            await processTTDownload(conn, from, mek, num, pending);
        } finally {
            if (pending) pending.processing.delete(num);
            if (pending) pending.expires = Date.now() + 5 * 60 * 1000;
        }

    } catch (err) {
        console.error('[tiktok body handler]', err);
    }
});
