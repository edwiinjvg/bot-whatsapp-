// antidelete.js
// Evento que revierte mensajes borrados si antidelete está activado

const store = {} // Guardamos los mensajes temporalmente

module.exports = async function antideleteEvent(sock, updates) {
  try {
    for (const update of updates) {
      const { key, updateType } = update

      // Solo nos interesan los borrados
      if (update.updateType !== 'message-revoke') continue

      const jid = key.remoteJid
      const participant = key.participant || jid
      if (!participant) continue

      // Chequear si antidelete está activo en este chat
      const chat = global.db.data.chats[jid]
      if (!chat?.antidelete) continue

      const msgId = key.id
      const original = store[msgId]

      if (!original) {
        await sock.sendMessage(jid, {
          text: `🚨 ${participant.split('@')[0]} borró un mensaje, pero no lo tengo guardado 😅`
        })
        continue
      }

      let text = ''
      if (original.message.conversation) {
        text = original.message.conversation
      } else if (original.message.extendedTextMessage?.text) {
        text = original.message.extendedTextMessage.text
      } else {
        text = '[Mensaje no textual]'
      }

      await sock.sendMessage(jid, {
        text: `🚨 ${participant.split('@')[0]} borró este mensaje:\n\n${text}`
      })

      // Limpiar store
      delete store[msgId]
    }
  } catch (err) {
    console.error('❌ Error en antidelete:', err)
  }
}

// ======================
// Guardar mensajes entrantes para antidelete
// Esto debe llamarse desde tu handler de mensajes
module.exports.storeMessage = function storeMessage(msg) {
  const key = msg.key.id
  if (!key) return
  store[key] = msg
}