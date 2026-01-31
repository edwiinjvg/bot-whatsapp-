const chalk = require('chalk')

async function logMessage(m, conn) {
  if (!m.message) return

  try {
    // -------------------
    // Identificación del remitente
    // -------------------
    const senderJid = m.sender || m.key.participant || m.key.remoteJid
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const chatName = isGroup ? m.key.remoteJid : null

    // Intentamos sacar el nombre del usuario, sino usamos el JID
    let name = senderJid
    if (conn && conn.getName) {
      try { name = await conn.getName(senderJid) } catch {}
    }

    // -------------------
    // Contenido del mensaje con emoji según tipo
    // -------------------
    let content = ''
    if (m.message.conversation) content = m.message.conversation
    else if (m.message.extendedTextMessage?.text) content = m.message.extendedTextMessage.text
    else if (m.message.imageMessage) content = 'Imagen 📸'
    else if (m.message.videoMessage) content = 'Video 🎥'
    else if (m.message.audioMessage) content = m.message.audioMessage.ptt ? 'Mensaje de voz 🎤' : 'Audio 🔊'
    else if (m.message.stickerMessage) content = 'Sticker 🏷️'
    else if (m.message.documentMessage) content = 'Documento 📄'
    else content = '[Mensaje desconocido]'

    if (content.length > 100) content = content.slice(0, 100) + '...'

    // -------------------
    // Datos del usuario desde la base de datos
    // -------------------
    const user = global.db?.data?.users?.[senderJid] || {}
    const level = user.level || 1
    const role = user.role || 'Novato'
    const coins = user.coins || 0
    const diamonds = user.diamonds || 0
    const exp = user.exp || 0
    const premium = user.premiumTime > 0 ? '✅' : '❌'

    // -------------------
    // Imprimir en consola
    // -------------------
    console.log(chalk.cyan('╭━━━━━━━━━━━━━━'))
    if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${chatName}`))
    console.log(`┃ ${chalk.green(name)}: ${chalk.whiteBright(content)}`)
    console.log(chalk.cyan('┃━━━━━━━━━━━━━━'))
    console.log(`┃ Monedas: ${chalk.yellow(coins)} 🪙`)
    console.log(`┃ Diamantes: ${chalk.blue(diamonds)} 💎`)
    console.log(`┃ Exp: ${chalk.magenta(exp)} ✨`)
    console.log(`┃ Nivel: ${chalk.green(level)} 📈`)
    console.log(`┃ Rol: ${chalk.whiteBright(role)} 🏷️`)
    console.log(`┃ Premium: ${premium}`)
    console.log(chalk.cyan('╰━━━━━━━━━━━━━━\n'))

  } catch (e) {
    console.log('❌ Error logMessage:', e)
  }
}

module.exports = { logMessage }