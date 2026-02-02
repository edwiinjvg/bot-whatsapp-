const { getContentType } = require('@whiskeysockets/baileys')

async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg.message) return
    if (msg.key.fromMe) return

    const from = msg.key.remoteJid
    const chat = global.db.data.chats[from]
    if (!chat?.antiviewonce) return

    // 🔥 DESENVOLVER EPHEMERAL
    let message = msg.message
    if (message.ephemeralMessage) {
      message = message.ephemeralMessage.message
    }

    const type = getContentType(message)

    if (
      type !== 'viewOnceMessage' &&
      type !== 'viewOnceMessageV2' &&
      type !== 'viewOnceMessageV2Extension'
    ) return

    const viewOnce = message[type]
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