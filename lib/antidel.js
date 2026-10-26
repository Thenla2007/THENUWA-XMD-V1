const fs = require('fs')
const path = require('path')

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..')
const DATA_FILE = path.join(DATA_DIR, 'data', 'antidelete-messages.json')

function readMessages() {
    try {
        if (!fs.existsSync(DATA_FILE)) return []
        const data = fs.readFileSync(DATA_FILE, 'utf8')
        return data.trim() ? JSON.parse(data) : []
    } catch (error) {
        console.error('AntiDelete read error:', error.message)
        return []
    }
}

function saveMessages(messages) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2))
}

async function DeletedText() {
    return null
}

async function DeletedMedia() {
    return null
}

async function AntiDelete() {
    return null
}

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    readMessages,
    saveMessages
}
