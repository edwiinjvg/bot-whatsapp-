const db = global.db.data

// Almacen temporal de mensajes por chat
const messageStore = {}

/**
 * Guardar mensajes entrantes para poder mostrarlos si se borran
 */
function storeMessage(msg) {
  if (!msg.key || !msg.message) return
  const jid = msg.key.remoteJid
  if (!messageStore[jid]) messageStore[jid] = {}
  messageStore[jid][msg.key.id] = msg
}

/**
 * Evento antidelete
 */
async function antideleteEvent(sock, updates) {
  for (const u of updates) {
    if (!u.update?.key) continue
    const { id, remoteJid } = u.update.key

    // Revisar si antidelete está activado en el chat
    if (!db.chats?.[remoteJid]?.antidelete) return

    const original = messageStore[remoteJid]?.[id]
    if (!original) continue

    const from = remoteJid
    const sender = original.key.participant || original.key.remoteJid

    // Obtener contenido del mensaje según tipo
    let text = '[Mensaje no soportado]'
    const msgContent = original.message

    if (msgContent.conversation) text = msgContent.conversation
    else if (msgContent.extendedTextMessage?.text)
      text = msgContent.extendedTextMessage.text
    else if (msgContent.imageMessage?.caption)
      text = `[Foto] ${msgContent.imageMessage.caption}`
    else if (msgContent.videoMessage?.caption)
      text = `[Video] ${msgContent.videoMessage.caption}`
    else if (msgContent.stickerMessage) text = '[Sticker]'

    await sock.sendMessage(from, {
      text: `🚨 @${sender.split('@')[0]} intentó borrar un mensaje:\n\n${text}`,
      mentions: [sender]
    })
  }
}

module.exports = { antideleteEvent, storeMessage }