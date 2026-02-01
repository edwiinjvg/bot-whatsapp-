module.exports = async function welcomeEvent(sock, update) {
  try {
    const { id, participants, action } = update

    // Solo grupos
    if (!id.endsWith('@g.us')) return

    const chat = global.db.data.chats[id]
    if (!chat || !chat.welcome) return

    for (const user of participants) {
      if (action === 'add') {
        await sock.sendMessage(id, {
          text: `👋 Bienvenido @${user.split('@')[0]}  
Portate bien o te saco 😎`,
          mentions: [user]
        })
      }

      if (action === 'remove') {
        await sock.sendMessage(id, {
          text: `👋 @${user.split('@')[0]} se fue del grupo  
Uno menos pa moderar 😴`,
          mentions: [user]
        })
      }
    }
  } catch (e) {
    console.error('❌ Error en welcome:', e)
  }
}