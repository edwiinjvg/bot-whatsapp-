// lib/events/antidelete.js
const db = global.db.data

// Un objeto temporal para guardar mensajes recientes
const messageStore = {}

function storeMessage(msg) {
  if (!msg.key || !msg.message) return
  const jid = msg.key.remoteJid
  if (!messageStore[jid]) messageStore[jid] = {}
  messageStore[jid][msg.key.id] = msg
}

async function antideleteEvent(sock, updates) {
  for (const u of updates) {
    if (!u.update?.key) continue
    const { id, remoteJid } = u.update.key

    if (!db.chats?.[remoteJid]?.antidelete) return

    const original = messageStore[remoteJid]?.[id]
    if (!original) continue // si no lo tenemos guardado, nada que mostrar

    const from = remoteJid
    const sender = original.key.participant || original.key.remoteJid
    const text =
      original.message.conversation ||
      original.message.extendedTextMessage?.text ||
      '[Mensaje no soportado]'

    await sock.sendMessage(from, {
      text: `🚨 @${sender.split('@')[0]} intentó borrar un mensaje:\n\n${text}`,
      mentions: [sender]
    })
  }
}

module.exports = { antideleteEvent, storeMessage }