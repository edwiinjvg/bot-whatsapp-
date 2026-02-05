const { initChat } = require('../database')
const { jidFromEvent } = require('../helpers/jid')
const { invisibleLink, buildExternalAdReply } = require('../helpers/ui')

module.exports = async function welcomeEvent(sock, update) {
  try {
    const { id, participants, action } = update
    if (!id || !participants?.length) return

    initChat(id)
    const chat = global.db.data.chats[id]
    if (!chat?.welcome) return

    // links globales
    const links = global.links?.all || []
    const randomLink =
      links[Math.floor(Math.random() * links.length)] ||
      'https://wa.me/'

    for (const p of participants) {
      const jid = jidFromEvent(p)
      if (!jid) continue

      const userTag = jid.split('@')[0]

      // foto de perfil como URL
      let pp
      try {
        pp = await sock.profilePictureUrl(jid, 'image')
      } catch {
        // fallback: foto genérica online o wa.me
        pp = 'https://imgur.com/a/hTT6zCW'
      }

      let text = ''

      if (action === 'add') {
        text =
          `👋 Bienvenido @${userTag}\n\n` +
          `Pórtate fino o te saco a patadas 😈\n` +
          invisibleLink(randomLink)
      }

      if (action === 'remove') {
        text =
          `👋 @${userTag} se fue del grupo\n\n` +
          `Que no cierre la puerta XD\n` +
          invisibleLink(randomLink)
      }

      if (!text) continue

      await sock.sendMessage(
        id,
        {
          text,
          mentions: [jid],
          contextInfo: {
            forwardingScore: 9999999,
            isForwarded: true,
            externalAdReply: buildExternalAdReply({
              title: global.config.bot.name,
              body: 'Síguenos 😈',
              thumbnailUrl: pp,
              sourceUrl: randomLink
            })
          }
        }
      )
    }
  } catch (err) {
    console.error('❌ Error en welcome:', err)
  }
}