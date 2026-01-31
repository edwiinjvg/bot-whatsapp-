import chalk from 'chalk'
import PhoneNumber from 'awesome-phonenumber'

export async function logMessage(m, conn) {
  if (!m.message) return

  // -------------------
  // Nombre y número del remitente
  // -------------------
  const number = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '')).getNumber('international') || m.sender
  const name = await conn.getName(m.sender) || 'Anónimo'
  const isGroup = m.key.remoteJid.endsWith('@g.us')
  const chatName = isGroup ? await conn.getName(m.key.remoteJid) : null

  // -------------------
  // Tipo de mensaje
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
  // Base de datos del usuario
  // -------------------
  const user = global.db?.data?.users?.[m.sender] || {}
  const level = user.level || 1
  const role = user.role || 'Novato'
  const coins = user.coins || 0
  const diamonds = user.diamonds || 0
  const exp = user.exp || 0
  const premium = user.premiumTime > 0 ? '✅' : '❌'

  // -------------------
  // Chat tipo
  // -------------------
  const chatType = isGroup ? 'Grupo' : 'Privado'
  const chatLabel = isGroup ? `${chatName} (${m.key.remoteJid})` : number

  // -------------------
  // Menciones y respuestas
  // -------------------
  let mentions = ''
  if (m.mentionedJid?.length) {
    mentions = m.mentionedJid
      .map(jid => '@' + jid.split('@')[0])
      .join(', ')
  }

  let replyTo = ''
  if (m.message.extendedTextMessage?.contextInfo?.participant) {
    const repliedName = await conn.getName(m.message.extendedTextMessage.contextInfo.participant)
    replyTo = `(responde a ${repliedName})`
  }

  // -------------------
  // Impresión en consola
  // -------------------
  console.log(chalk.cyan('╭━━━━━━━━━━━━━━𖡼'))
  console.log(
    chalk.blueBright(`┃ [${chatType}]`) + ` ${chalk.greenBright(number)} ~ ${chalk.yellow(name)} ${replyTo}`
  )
  if (isGroup) console.log(chalk.magenta(`┃ Grupo: ${chatLabel}`))
  console.log(`┃ Tipo: ${chalk.magenta(type)} | Mensaje: ${content}`)
  if (mentions) console.log(`┃ Menciones: ${chalk.blueBright(mentions)}`)
  console.log(
    `┃ Nivel: ${level} | Rol: ${role} | Coins: ${coins} | Diamantes: ${diamonds} | Exp: ${exp} | Premium: ${premium}`
  )
  console.log(chalk.cyan('╰━━━━━━━━━━━━━━𖡼\n'))
}