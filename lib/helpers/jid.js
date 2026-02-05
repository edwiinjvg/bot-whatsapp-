// ======================
// BASE
// ======================
function normalizeBasic(jid) {
  if (typeof jid !== 'string') return null

  return jid
    .replace(/@c\.us$/, '@s.whatsapp.net')
    .replace(/:\d+@/, '@')
}

// ======================
// DESDE MENSAJES
// ======================
function jidFromMessage(msg) {
  if (!msg?.key) return null

  let jid = msg.key.participant || msg.key.remoteJid
  if (!jid) return null

  if (jid.endsWith('@g.us')) {
    jid = msg.key.participant
  }

  return normalizeBasic(jid)
}

// ======================
// DESDE EVENTOS
// ======================
function jidFromEvent(value) {
  if (!value) return null

  if (typeof value === 'string') {
    return normalizeBasic(value)
  }

  if (typeof value === 'object' && value.id) {
    return normalizeBasic(value.id)
  }

  return null
}

module.exports = {
  jidFromMessage,
  jidFromEvent
}