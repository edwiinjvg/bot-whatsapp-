function normalizeUserJid(msg) {
  let jid = msg.key.participant || msg.key.remoteJid
  if (!jid) return null
  if (jid.endsWith('@g.us')) jid = msg.key.participant
  return jid
    .replace(/@c\.us$/, '@s.whatsapp.net')
    .replace(/:\d+@/, '@')
}

module.exports = { normalizeUserJid }