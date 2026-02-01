module.exports = async function antidelete(sock, updates) {
  try {
    for (const update of updates) {
      const msg = update
      if (!msg.key || !msg.key.remoteJid) continue

      const from = msg.key.remoteJid
      if (!from.endsWith('@g.us')) continue

      const chat = global.db.data.chats[from]
      if (!chat || !chat.antidelete) continue

      // Si no fue borrado, chao
      if (!msg.messageStubType) continue
      if (msg.messageStubType !== 1) continue

      const user = msg.key.participant
      if (!user) continue

      // Mensaje original
      const original = msg.messageStubParameters?.[0]
      if (!original) {
        await sock.sendMessage(from, {
          text: `🚫 @${user.split('@')[0]} borró un mensaje`,
          mentions: [user]
        })
        continue
      }

      await sock.sendMessage(from, {
        text:
          `🚫 *Mensaje borrado*\n\n` +
          `👤 @${user.split('@')[0]} intentó borrar:\n\n` +
          original,
        mentions: [user]
      })
    }
  } catch (e) {
    console.error('❌ Error en antidelete:', e)
  }
}