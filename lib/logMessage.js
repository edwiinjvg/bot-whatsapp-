const chalk = require('chalk')

async function logMessage(m, conn) {
  if (!m.message) return

  try {
    // -------------------
    // Info del remitente
    // -------------------
    const senderJid = m.sender || m.key.participant || m.key.remoteJid
    const isGroup = m.key.remoteJid.endsWith('@g.us')

    // Nombre del usuario
    const senderName = m.pushName || senderJid.split('@')[0]

    // Número del usuario
    const senderNumber = '+' + senderJid.split('@')[0]

    // Nombre del grupo
    let chatName = ''
    if (isGroup) {
      try {
        const metadata = await conn.groupMetadata(m.key.remoteJid)
        chatName = metadata.subject || m.key.remoteJid
      } catch {
        chatName = m.key.remoteJid
      }
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
    const coins = user.coins || 0
    const diamonds = user.diamonds || 0
    const exp = user.exp || 0
    const level = user.level || 1
    const role = user.role || 'Novato'
    const premium = user.premiumTime > 0 ? '✅' : '❌'

    // -------------------
    // Timestamp
    // -------------------
    const msgDate = new Date(m.messageTimestamp?.low * 1000 || Date.now())
    const hours = msgDate.getHours().toString().padStart(2, '0')
    const minutes = msgDate.getMinutes().toString().padStart(2, '0')
    const timestamp = `${hours}:${minutes}`

    // -------------------
    // Consola visual
    // -------------------
    console.log(chalk.cyan('╭━━━━━━━━━━━━━━━━━'))
    if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${chatName} 👥`))
    console.log(chalk.blueBright(`┃ Número: ${senderNumber} 📞`))
    console.log(chalk.yellow(`┃ Usuario: ${senderName} 👤`))
    console.log(chalk.whiteBright(`┃ Mensaje: ${content}`))
    console.log(chalk.whiteBright(`┃ Hora: ${timestamp} ⏰`))
    console.log(chalk.cyan('┃━━━━━━━━━━━━━━━━━'))
    console.log(`┃ Monedas: ${coins} 🪙`)
    console.log(`┃ Diamantes: ${diamonds} 💎`)
    console.log(`┃ Exp: ${exp} ✨`)
    console.log(`┃ Nivel: ${level} 📈`)
    console.log(`┃ Rol: ${role} 🏷️`)
    console.log(`┃ Premium: ${premium}`)
    console.log(chalk.cyan('╰━━━━━━━━━━━━━━━━━\n'))

  } catch (e) {
    console.log('❌ Error logMessage:', e)
  }
}

module.exports = { logMessage }