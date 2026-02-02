async function antiviewonceEvent(sock, msg) {
  try {
    if (!msg?.message) return
    if (!msg.key.remoteJid.endsWith('@g.us')) return

    const chatId = msg.key.remoteJid
    const chat = global.db.data.chats[chatId]
    if (!chat?.antiviewonce) return

    const sender = msg.key.participant || msg.key.remoteJid
    const m = msg.message

    // ===== IMAGEN VIEW ONCE =====
    if (m.imageMessage?.viewOnce) {
      const buffer = await sock.downloadMediaMessage(msg)

      await sock.sendMessage(chatId, {
        image: buffer,
        caption: `👀 @${sender.split('@')[0]} mandó esto como *ver una sola vez*`,
        mentions: [sender]
      })
    }

    // ===== VIDEO VIEW ONCE =====
    if (m.videoMessage?.viewOnce) {
      const buffer = await sock.downloadMediaMessage(msg)

      await sock.sendMessage(chatId, {
        video: buffer,
        caption: `👀 @${sender.split('@')[0]} mandó esto como *ver una sola vez*`,
        mentions: [sender]
      })
    }
  } catch (e) {
    console.error('❌ Error en antiviewonce:', e)
  }
}

module.exports = { antiviewonceEvent }