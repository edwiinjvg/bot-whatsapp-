const { jidFromEvent } = require('./helpers/jid')

async function getAdmins(sock, from, sender, botJid) {
  let isBotAdmin = false
  let isUserAdmin = false

  if (!from?.endsWith('@g.us')) {
    return { isBotAdmin, isUserAdmin }
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants || []

  const normBot = jidFromEvent(botJid)
  const normSender = jidFromEvent(sender)

  isBotAdmin = participants.some(p => {
    const pid = jidFromEvent(p.id)
    return pid === normBot && (p.admin || p.superAdmin)
  })

  isUserAdmin = participants.some(p => {
    const pid = jidFromEvent(p.id)
    return pid === normSender && (p.admin || p.superAdmin)
  })

  return { isBotAdmin, isUserAdmin }
}

module.exports = { getAdmins }