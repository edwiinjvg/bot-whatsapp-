const { initChat } = require('../database')

module.exports = async function welcomeEvent(sock, update) {
  try {
    const { id, participants, action } = update
    if (!id || !participants || !participants.length) return

    // Inicializar chat
    initChat(id)
    const chat = global.db.data.chats[id]

    // Si welcome está apagado, no hacer nada
    if (!chat.welcome) return

    for (const jid of participants) {
      const userTag = jid.split('@')[0]

      if (action === 'add') {
        await sock.sendMessage(id, {
          text: `👋 Bienvenido @${userTag}\nPortate serio o te saco 😈`,
          mentions: [jid]
        })
      }

      if (action === 'remove') {
        await sock.sendMessage(id, {
          text: `👋 @${userTag} salió del grupo\nUno menos pa repartir comida XD`,
          mentions: [jid]
        })
      }
    }
  } catch (err) {
    console.error('❌ Error en welcome:', err)
  }
}