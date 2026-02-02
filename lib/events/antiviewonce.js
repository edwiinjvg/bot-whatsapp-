const { getContentType } = require('@whiskeysockets/baileys')
const { db } = require('../database')

async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg.message) return
    if (msg.key.fromMe) return

    const from = msg.key.remoteJid
    const chat = db.data.chats[from]
    if (!chat || !chat.antiviewonce) return

    const type = getContentType(msg.message)
    if (type !== 'viewOnceMessage') return

    const viewOnceMsg = msg.message.viewOnceMessage.message
    const mediaType = getContentType(viewOnceMsg)

    if (!['imageMessage', 'videoMessage'].includes(mediaType)) return

    await sock.sendMessage(from, {
      forward: {
        key: msg.key,
        message: viewOnceMsg
      }
    })
  } catch (e) {
    console.error('❌ Error antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }