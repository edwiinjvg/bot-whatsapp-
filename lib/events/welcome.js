const { initChat } = require('../database')
const { jidFromEvent } = require('../jid')
const fs = require('fs')
const path = require('path')

const DEFAULT_PIC = path.join(__dirname, '../media/user.jpg')

module.exports = async function welcomeEvent(sock, update) {
  try {
    const { id, participants, action } = update
    if (!id || !participants?.length) return

    initChat(id)
    const chat = global.db.data.chats[id]
    if (!chat?.welcome) return

    for (const p of participants) {
      const jid = jidFromEvent(p)
      if (!jid) continue

      const userTag = jid.split('@')[0]

      let profilePic
      try {
        profilePic = await sock.profilePictureUrl(jid, 'image')
      } catch {
        profilePic = DEFAULT_PIC
      }

      const imagePayload = fs.existsSync(profilePic)
        ? fs.readFileSync(profilePic)
        : { url: profilePic }

      // ======================
      // BIENVENIDA
      // ======================
      if (action === 'add') {
        await sock.sendMessage(id, {
          image: imagePayload,
          caption:
            `👋 Bienvenido @${userTag}\n\n` +
            `Pórtate fino o te saco a patadas 😈`,
          mentions: [jid]
        })
      }

      // ======================
      // DESPEDIDA
      // ======================
      if (action === 'remove') {
        await sock.sendMessage(id, {
          image: imagePayload,
          caption:
            `👋 @${userTag} se fue del grupo\n\n` +
            `Que no cierre la puerta XD`,
          mentions: [jid]
        })
      }
    }
  } catch (err) {
    console.error('❌ Error en welcome:', err)
  }
}