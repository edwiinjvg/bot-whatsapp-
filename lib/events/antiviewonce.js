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

    // 🔴 TODOS los tipos de view once
    if (
      type !== 'viewOnceMessage' &&
      type !== 'viewOnceMessageV2' &&
      type !== 'viewOnceMessageV2Extension'
    ) return

    const viewOnce =
      msg.message.viewOnceMessage ||
      msg.message.viewOnceMessageV2 ||
      msg.message.viewOnceMessageV2Extension

    if (!viewOnce?.message) return

    const mediaType = getContentType(viewOnce.message)
    if (!['imageMessage', 'videoMessage'].includes(mediaType)) return

    await sock.sendMessage(from, {
      forward: {
        key: msg.key,
        message: viewOnce.message
      }
    })
  } catch (e) {
    console.error('❌ Error antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }