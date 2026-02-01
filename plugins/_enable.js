const validFeatures = require('../lib/features')

const handler = async (sock, msg, args, { chat, reply, command }) => {
  const feature = args[0]

  if (!feature)
    return reply('¿Qué vas a activar o desactivar? XD')

  if (!validFeatures.includes(feature))
    return reply('Esa vaina no existe')

  const value = command === 'enable'
  chat[feature] = value

  reply(`✅ *${feature}* ${value ? 'activado' : 'desactivado'}`)
}

handler.command = /^(enable|disable)$/i
handler.group = true
handler.groupAdmin = true

module.exports = handler