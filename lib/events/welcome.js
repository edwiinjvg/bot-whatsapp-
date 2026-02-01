const { initChat } = require('../database')

function normalizeJid(participant) {
  if (typeof participant === 'string') return participant
  if (typeof participant === 'object' && participant.id) return participant.id
  return null
}

module.exports = async function welcomeEvent(sock, update) {
  try {
    const { id, participants, action } = update
    if (!id || !participants || !participants.length) return

    initChat(id)
    const chat = global.db.data.chats[id]
    if (!chat.welcome) return

    for (const p of participants) {
      const jid = normalizeJid(p)
      if (!jid) continue

      const userTag = jid.split('@')[0]

      if (action === 'add') {
        await sock.sendMessage(id, {
          text: `👋 Bienvenido @${userTag}\nPórtate fino o te saco a patadas 😈`,
          mentions: [jid]
        })
      }

      if (action === 'remove') {
        await sock.sendMessage(id, {
          text: `👋 @${userTag} se fue del grupo\nQue no cierre la puerta XD`,
          mentions: [jid]
        })
      }
    }
  } catch (err) {
    console.error('❌ Error en welcome:', err)
  }
}