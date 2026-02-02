const messageStore = new Map()

function storeMessage(msg) {
  try {
    if (!msg?.key?.id) return
    if (!msg.message) return

    messageStore.set(msg.key.id, msg)

    // limpiar memoria
    if (messageStore.size > 1000) {
      const firstKey = messageStore.keys().next().value
      messageStore.delete(firstKey)
    }
  } catch (e) {
    console.error('❌ Error guardando mensaje:', e)
  }
}

async function antideleteEvent(sock, updates) {
  try {
    for (const update of updates) {
      if (!update.key) continue
      if (!update.key.remoteJid?.endsWith('@g.us')) continue

      // 🚨 ESTO ES LO IMPORTANTE
      if (update.update?.message !== null) continue

      const chatId = update.key.remoteJid
      const chat = global.db.data.chats[chatId]
      if (!chat?.antidelete) continue

      const original = messageStore.get(update.key.id)
      if (!original) continue

      const sender =
        original.key.participant || original.key.remoteJid

      let text = '[Mensaje]'
      const m = original.message

      if (m.conversation) text = m.conversation
      else if (m.extendedTextMessage?.text)
        text = m.extendedTextMessage.text
      else if (m.imageMessage) text = '[Imagen]'
      else if (m.videoMessage) text = '[Video]'
      else if (m.stickerMessage) text = '[Sticker]'
      else if (m.audioMessage) text = '[Audio]'

      await sock.sendMessage(chatId, {
        text:
          `🚫 @${sender.split('@')[0]} borró un mensaje:\n\n` +
          `> ${text}`,
        mentions: [sender]
      })
    }
  } catch (e) {
    console.error('❌ Error en antidelete:', e)
  }
}

module.exports = {
  storeMessage,
  antideleteEvent
}