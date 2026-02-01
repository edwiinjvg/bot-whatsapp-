// lib/events/antidelete.js
const { saveDatabase } = require('../database')

const messageCache = new Map()

/**
 * Guardar los mensajes entrantes para poder revisarlos si los borran
 */
function storeMessage(msg) {
  try {
    if (!msg.key || !msg.message) return
    const chatId = msg.key.remoteJid
    const id = msg.key.id
    messageCache.set(id, { ...msg, chatId })
    // Limpiar cache vieja para no llenar memoria
    if (messageCache.size > 1000) {
      const keys = messageCache.keys()
      messageCache.delete(keys.next().value)
    }
  } catch (e) {
    console.error('❌ Error guardando mensaje:', e)
  }
}

/**
 * Evento que se dispara cuando hay actualización de mensajes
 */
async function antideleteEvent(sock, updates) {
  try {
    if (!Array.isArray(updates)) updates = [updates]

    for (const update of updates) {
      const key = update.key
      if (!key) continue
      const { remoteJid, id, participant } = key

      // Solo grupos
      if (!remoteJid.endsWith('@g.us')) continue

      const chat = global.db.data.chats[remoteJid]
      if (!chat?.antidelete) continue

      // Ver si es borrado
      if (update.update?.messageStubType === 68) {
        const original = messageCache.get(id)
        if (!original) continue

        const from = participant || original.key.participant
        let userJid = from
        if (userJid.includes(':')) userJid = userJid.split(':')[0]

        let content = ''
        if (original.message.conversation) {
          content = original.message.conversation
        } else if (original.message.extendedTextMessage?.text) {
          content = original.message.extendedTextMessage.text
        } else if (original.message.imageMessage) {
          content = '[Imagen]'
        } else if (original.message.videoMessage) {
          content = '[Video]'
        } else if (original.message.stickerMessage) {
          content = '[Sticker]'
        } else {
          content = '[Mensaje]'
        }

        await sock.sendMessage(remoteJid, {
          text: `⚠️ <@${userJid.split('@')[0]}> no podés borrar mensajes!\n> ${content}`,
          mentions: [userJid]
        })
      }
    }
  } catch (e) {
    console.error('❌ Error en antidelete:', e)
  }
}

module.exports = { storeMessage, antideleteEvent }