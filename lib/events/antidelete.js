const { getMessage } = require('../store')

module.exports = async function antidelete(sock, updates) {
  try {
    for (const update of updates) {
      if (!update.key || !update.key.remoteJid) continue

      const from = update.key.remoteJid
      if (!from.endsWith('@g.us')) continue

      const chat = global.db.data.chats[from]
      if (!chat || !chat.antidelete) continue

      // esto indica delete
      if (!update.message || !update.message.protocolMessage) continue
      if (update.message.protocolMessage.type !== 0) continue

      const deletedKey = update.message.protocolMessage.key
      const original = getMessage(deletedKey.id)
      if (!original) return

      const user = deletedKey.participant || deletedKey.remoteJid

      let text = '*Mensaje borrado*\n\n'
      text += `👤 @${user.split('@')[0]}\n\n`

      if (original.message?.conversation) {
        text += original.message.conversation
      } else {
        text += '📎 Mensaje no textual'
      }

      await sock.sendMessage(from, {
        text,
        mentions: [user]
      })
    }
  } catch (e) {
    console.error('❌ Error en antidelete:', e)
  }
}