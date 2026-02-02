const { getContentType } = require('@whiskeysockets/baileys')
const db = require('../../lib/database').db

async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg.message) return
    if (msg.key.fromMe) return

    const from = msg.key.remoteJid
    const chat = db.data.chats[from]
    if (!chat || !chat.antiviewonce) return

    const type = getContentType(msg.message)
    if (type !== 'viewOnceMessage') return

    const viewOnce = msg.message.viewOnceMessage.message
    const mediaType = getContentType(viewOnce)

    if (!['imageMessage', 'videoMessage'].includes(mediaType)) return

    const media = viewOnce[mediaType]

    await sock.sendMessage(from, {
      [mediaType.replace('Message', '')]: {
        url: await sock.downloadAndSaveMediaMessage(
          { message: viewOnce, key: msg.key },
          'tmp'
        )
      },
      caption: media.caption || '👀 *View Once eliminado*'
    })
  } catch (e) {
    console.error('❌ Error en antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }