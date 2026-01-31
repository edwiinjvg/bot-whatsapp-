const chalk = require('chalk')
const PhoneNumber = require('awesome-phonenumber')

async function logMessage(m, conn) {
  if (!m.message) return

  try {
    // -------------------
    // Info del remitente
    // -------------------
    const senderJid = m.sender || m.key.participant || m.key.remoteJid
    let number = senderJid
    try {
      number = PhoneNumber('+' + senderJid.replace(/[^0-9]/g, '')).getNumber('international') || senderJid
    } catch (e) {
      number = senderJid
    }

    let userName = senderJid
    if (conn && conn.getName) {
      userName = await conn.getName(senderJid) || senderJid
    }

    const isGroup = m.key.remoteJid.endsWith('@g.us')
    let groupName = m.key.remoteJid
    if (isGroup && conn && conn.getName) {
      groupName = await conn.getName(m.key.remoteJid) || m.key.remoteJid
    }

    // -------------------
    // Tipo y contenido
    // -------------------
    let type = Object.keys(m.message)[0] || 'unknown'
    let content = ''
    if (m.message.conversation) content = m.message.conversation
    else if (m.message.extendedTextMessage?.text) content = m.message.extendedTextMessage.text
    else if (m.message.imageMessage) content = '[Imagen] 🖼️'
    else if (m.message.videoMessage) content = '[Video] 🎬'
    else if (m.message.audioMessage) content = m.message.audioMessage.ptt ? '[Mensaje de voz] 🎤' : '[Audio] 🎵'
    else if (m.message.stickerMessage) content = '[Sticker] ✨'
    else if (m.message.documentMessage) content = '[Documento] 📄'
    else if (m.message.contactMessage) content = '[Contacto] 📇'
    else content = `[${type}] 💬`

    if (content.length > 100) content = content.slice(0, 100) + '...'

    // -------------------
    // Info DB del usuario
    // -------------------
    const user = global.db?.data?.users?.[senderJid] || {}
    const level = user.level || 1
    const role = user.role || 'Novato'
    const coins = user.coins || 0
    const diamonds = user.diamonds || 0
    const exp = user.exp || 0
    const premium = user.premiumTime > 0 ? '✅' : '❌'

    // -------------------
    // Log en consola
    // -------------------
    console.log(chalk.cyan('╭━━━━━━━━━━━━━━'))
    if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${groupName} 👥`))
    console.log(chalk.blueBright(`┃ Número: ${number} 📞`))
    console.log(chalk.greenBright(`┃ Usuario: ${userName} 👤`))
    console.log(chalk.whiteBright(`┃ Mensaje: ${content}`))
    console.log(chalk.cyan('┃━━━━━━━━━━━━━━'))
    console.log(chalk.yellow(`┃ Monedas: ${coins} 🪙`))
    console.log(chalk.magenta(`┃ Diamantes: ${diamonds} 💎`))
    console.log(chalk.white(`┃ Exp: ${exp} ✨`))
    console.log(chalk.green(`┃ Nivel: ${level} 📈`))
    console.log(chalk.blue(`┃ Rol: ${role} 🏷️`))
    console.log(chalk.bgGreenBright.black(`┃ Premium: ${premium}`))
    console.log(chalk.cyan('╰━━━━━━━━━━━━━━\n'))

  } catch (e) {
    console.log('❌ Error logMessage:', e)
  }
}

module.exports = { logMessage }