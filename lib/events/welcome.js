const { initChat } = require('../database')
const { jidFromEvent } = require('../helpers/jid')
const { buildAdReply, pickRandom } = require('../helpers/ui')
const fs = require('fs')
const path = require('path')

const defaultPicPath = path.join(__dirname, '../../media/user.jpg')

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

      // ---------- Imagen ----------
      let image
      let thumbUrl

      try {
        const picUrl = await sock.profilePictureUrl(jid, 'image')
        image = { url: picUrl }
        thumbUrl = picUrl
      } catch {
        if (!fs.existsSync(defaultPicPath)) {
          console.error('❌ No existe media/user.jpg')
          continue
        }
        image = fs.readFileSync(defaultPicPath)
        thumbUrl = null
      }

      // ---------- AdReply ----------
      const adReply = buildAdReply({
        title: global.config.bot.name,
        body: 'Síguenos pues 👀',
        thumbnailUrl: thumbUrl,
        sourceUrl: pickRandom(global.links.all)
      })

      // ---------- Textos ----------
      if (action === 'add') {
        await sock.sendMessage(
          id,
          {
            image,
            caption:
              `👋 Bienvenido @${userTag}\n\n` +
              `Pórtate fino o te saco a patadas 😈`,
            mentions: [jid],
            ...adReply
          }
        )
      }

      if (action === 'remove') {
        await sock.sendMessage(
          id,
          {
            image,
            caption:
              `👋 @${userTag} se fue del grupo\n\n` +
              `Que no cierre la puerta XD`,
            mentions: [jid],
            ...adReply
          }
        )
      }
    }
  } catch (err) {
    console.error('❌ Error en welcome:', err)
  }
}