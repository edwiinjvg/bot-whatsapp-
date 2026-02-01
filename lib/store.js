if (!global.messageStore) global.messageStore = new Map()

function saveMessage(msg) {
  if (!msg.key || !msg.key.id) return
  global.messageStore.set(msg.key.id, msg)

  // limpiar después de 5 minutos
  setTimeout(() => {
    global.messageStore.delete(msg.key.id)
  }, 5 * 60 * 1000)
}

function getMessage(id) {
  return global.messageStore.get(id)
}

module.exports = { saveMessage, getMessage }