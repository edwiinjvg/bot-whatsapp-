const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const db = require('../database').db

async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg.message) return

    const chatId = msg.key.remoteJid
    const chat = db.data.chats[chatId]
    if (!chat || !chat.antiviewonce) return

    const m = msg.message

    // Detectar view once (todas las variantes)
    const viewOnce =
      m.viewOnceMessageV2 ||
      m.viewOnceMessageV2Extension ||
      m.viewOnceMessage

    if (!viewOnce) return

    const innerMsg = viewOnce.message
    const type = Object.keys(innerMsg)[0]

    if (type !== 'imageMessage' && type !== 'videoMessage') return

    const mediaType = type === 'imageMessage' ? 'image' : 'video'

    const stream = await downloadContentFromMessage(
      innerMsg[type],
      mediaType
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const caption = innerMsg[type].caption || ''

    await sock.sendMessage(chatId, {
      [mediaType]: buffer,
      caption: `👀 *View Once detectado*\n\n${caption}`
    })

  } catch (e) {
    console.error('❌ Error antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }