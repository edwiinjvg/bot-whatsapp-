const chalk = require('chalk')

async function logMessage(m) {
  if (!m.message) return

  try {
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const senderJid = m.key.participant || m.key.remoteJid
    const senderName = m.pushName || senderJid.split('@')[0]

    // Nombre del grupo o JID
    const chatName = isGroup ? (m.name || m.key.remoteJid) : null

    // -------------------
    // Contenido del mensaje con texto y emoji
    // -------------------
    let content = ''
    if (m.message.conversation) content = m.message.conversation
    else if (m.message.extendedTextMessage?.text) content = m.message.extendedTextMessage.text
    else if (m.message.imageMessage) content = '[Imagen] 🖼️'
    else if (m.message.videoMessage) content = '[Video] 🎬'
    else if (m.message.audioMessage) content = m.message.audioMessage.ptt ? '[Mensaje de voz 🎤]' : '[Audio 🔊]'
    else if (m.message.stickerMessage) content = '[Sticker 🏷️]'
    else if (m.message.documentMessage) content = '[Documento 📄]'
    else content = '[Otro mensaje]'

    // -------------------
    // Info de usuario desde DB
    // -------------------
    const user = global.db?.data?.users?.[senderJid] || {}
    const level = user.level || 1
    const role = user.role || 'Novato'
    const coins = user.coins || 0
    const diamonds = user.diamonds || 0
    const exp = user.exp || 0
    const premium = user.premiumTime > 0 ? '✅' : '❌'

    // -------------------
    // Impresión limpia
    // -------------------
    console.log(chalk.cyan('╭━━━━━━━━━━━━━━'))
    if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${chatName}`))
    console.log(chalk.green(`┃ ${senderName}: ${content}`))
    console.log(chalk.cyan('┃━━━━━━━━━━━━━━'))
    console.log(chalk.yellow(`┃ Monedas: ${coins} 🪙`))
    console.log(chalk.blue(`┃ Diamantes: ${diamonds} 💎`))
    console.log(chalk.white(`┃ Exp: ${exp} ✨`))
    console.log(chalk.green(`┃ Nivel: ${level} 📈`))
    console.log(chalk.magenta(`┃ Rol: ${role} 🏷️`))
    console.log(chalk.bgGreenBright.black(`┃ Premium: ${premium}`))
    console.log(chalk.cyan('╰━━━━━━━━━━━━━━\n'))

  } catch (e) {
    console.log('❌ Error logMessage:', e)
  }
}

module.exports = { logMessage }