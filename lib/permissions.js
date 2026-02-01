async function getAdmins(sock, from, sender, botJid) {
  let isBotAdmin = false
  let isUserAdmin = false

  if (!from.endsWith('@g.us')) {
    return { isBotAdmin, isUserAdmin }
  }

  const metadata = await sock.groupMetadata(from)
  const participants = metadata.participants

  isBotAdmin = participants.some(
    p => p.id === botJid && (p.admin || p.superAdmin)
  )

  isUserAdmin = participants.some(
    p => p.id === sender && (p.admin || p.superAdmin)
  )

  return { isBotAdmin, isUserAdmin }
}

module.exports = { getAdmins }