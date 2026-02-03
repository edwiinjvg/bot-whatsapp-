const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { db } = require('../database')

function unwrapMessage(message) {
  if (!message) return null

  if (message.ephemeralMessage)
    return unwrapMessage(message.ephemeralMessage.message)

  if (message.viewOnceMessage)
    return unwrapMessage(message.viewOnceMessage.message)

  if (message.viewOnceMessageV2)
    return unwrapMessage(message.viewOnceMessageV2.message)

  if (message.viewOnceMessageV2Extension)
    return unwrapMessage(message.viewOnceMessageV2Extension.message)

  return message
}

async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg.message) return

    const chatId = msg.key.remoteJid
    const chat = db.data.chats[chatId]
    if (!chat || !chat.antiviewonce) return

    const message = unwrapMessage(msg.message)
    if (!message) return

    const type = Object.keys(message)[0]
    if (type !== 'imageMessage' && type !== 'videoMessage') return

    const mediaType = type === 'imageMessage' ? 'image' : 'video'

    const stream = await downloadContentFromMessage(
      message[type],
      mediaType
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const caption = message[type].caption || ''

    await sock.sendMessage(chatId, {
      [mediaType]: buffer,
      caption: `👀 *View Once reventado*\n\n${caption}`
    })

  } catch (e) {
    console.error('❌ Error antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }