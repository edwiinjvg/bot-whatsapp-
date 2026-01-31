const chalk = require('chalk')
const PhoneNumber = require('awesome-phonenumber')

async function logMessage(m, conn) {
  if (!m.message) return

  try {
    // -------------------
    // Info del remitente
    // -------------------
    const senderJid = m.key.participant || m.key.remoteJid
    let number
    try {
      number = PhoneNumber('+' + senderJid.replace(/@.+$/, '')).getNumber('international') || senderJid
    } catch {
      number = senderJid
    }

    // -------------------
    // Nombre del remitente
    // -------------------
    let name = senderJid
    if (conn.store && conn.store.contacts) {
      name = conn.store.contacts[senderJid]?.name || conn.store.contacts[senderJid]?.notify || senderJid
    }

    // -------------------
    // Info del chat
    // -------------------
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    let chatName = m.key.remoteJid
    if (isGroup && conn.store && conn.store.groupMetadata) {
      chatName = conn.store.groupMetadata[m.key.remoteJid]?.subject || m.key.remoteJid
    }

    // -------------------
    // Tipo y contenido
    // -------------------
    const type = Object.keys(m.message)[0] || 'unknown'
    let content = ''
    if (m.message.conversation) content = m.message.conversation
    else if (m.message.extendedTextMessage?.text) content = m.message.extendedTextMessage.text
    else if (m.message.imageMessage) content = '[Imagen]'
    else if (m.message.videoMessage) content = '[Video]'
    else if (m.message.audioMessage) content = m.message.audioMessage.ptt ? '[PTT]' : '[Audio]'
    else if (m.message.stickerMessage) content = '[Sticker]'
    else if (m.message.documentMessage) content = '[Documento]'
    else content = `[${type}]`

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
    // Menciones y reply
    // -------------------
    let mentions = ''
    if (m.mentionedJid?.length) {
      mentions = m.mentionedJid
        .map(jid => '@' + jid.split('@')[0])
        .join(', ')
    }

    let replyTo = ''
    if (m.message.extendedTextMessage?.contextInfo?.participant) {
      const replyJid = m.message.extendedTextMessage.contextInfo.participant
      let replyName = replyJid
      if (conn.store && conn.store.contacts) {
        replyName = conn.store.contacts[replyJid]?.name || conn.store.contacts[replyJid]?.notify || replyJid
      }
      replyTo = `(responde a ${replyName})`
    }

    // -------------------
    // Encabezado visual
    // -------------------
    console.log(chalk.cyan('╭━━━━━━━━━━━━━━𖡼'))
    console.log(chalk.blueBright(`┃ [${isGroup ? 'Grupo' : 'Privado'}]`) + ` ${chalk.greenBright(number)} ~ ${chalk.yellow(name)} ${replyTo}`)
    if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${chatName}`))
    console.log(`┃ Tipo: ${chalk.magenta(type)} | Mensaje: ${chalk.whiteBright(content)}`)
    if (mentions) console.log(`┃ Menciones: ${chalk.blueBright(mentions)}`)
    console.log(
      chalk.yellow(`┃ Nivel: ${level}`) +
      ' | ' + chalk.green(`Rol: ${role}`) +
      ' | ' + chalk.cyan(`Coins: ${coins}`) +
      ' | ' + chalk.magenta(`Diamantes: ${diamonds}`) +
      ' | ' + chalk.white(`Exp: ${exp}`) +
      ' | ' + chalk.bgGreenBright.black(`Premium: ${premium}`)
    )
    console.log(chalk.cyan('╰━━━━━━━━━━━━━━𖡼\n'))

  } catch (e) {
    console.log('❌ Error logMessage:', e)
  }
}

module.exports = { logMessage }