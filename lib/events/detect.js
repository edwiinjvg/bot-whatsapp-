const db = require('../database').db

module.exports = async function detectEvent(sock, update) {
  const jid = update.id
  if (!jid) return

  const chat = db.data.chats[jid]
  if (!chat || !chat.detect) return

  const action = update.action
  const target = update.participants?.[0]
  const author = update.author

  // ======================
  // CAMBIOS DEL GRUPO
  // ======================

  if (action === 'subject') {
    return sock.sendMessage(jid, {
      text: `✏️ *Cambio de nombre del grupo*\n\n🆕 Nuevo nombre:\n${update.subject}`
    })
  }

  if (action === 'description') {
    return sock.sendMessage(jid, {
      text: `📝 *Cambio de descripción del grupo*\n\n${update.desc || 'Descripción eliminada'}`
    })
  }

  if (action === 'picture') {
    return sock.sendMessage(jid, {
      text: `🖼️ *La foto del grupo fue actualizada*`
    })
  }

  if (action === 'announcement') {
    const isClosed = update.announcement
    return sock.sendMessage(jid, {
      text: isClosed
        ? '🔒 *Grupo cerrado*\nSolo los admins pueden escribir'
        : '🔓 *Grupo abierto*\nTodos pueden escribir'
    })
  }

  // ======================
  // ADMINS
  // ======================

  if (action === 'promote' || action === 'demote') {
    if (!target || !author) return

    const isPromote = action === 'promote'

    const text =
      `${isPromote ? '🟢 *Nuevo admin*' : '🔴 *Admin removido*'}\n\n` +
      `👤 Usuario:\n@${target.split('@')[0]}\n\n` +
      `🛠️ Acción por:\n@${author.split('@')[0]}`

    return sock.sendMessage(jid, {
      text,
      mentions: [target, author]
    })
  }

  // ======================
  // EXPULSIONES
  // ======================

  if (action === 'remove') {
    if (!target || !author) return

    const text =
      `🚫 *Usuario expulsado del grupo*\n\n` +
      `👤 Usuario:\n@${target.split('@')[0]}\n\n` +
      `🛠️ Expulsado por:\n@${author.split('@')[0]}`

    return sock.sendMessage(jid, {
      text,
      mentions: [target, author]
    })
  }
}