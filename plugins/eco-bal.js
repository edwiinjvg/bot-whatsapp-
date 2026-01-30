const handler = async (sock, msg, args, { user, reply }) => {

  // ======================
  // DETERMINAR OBJETIVO
  // ======================
  let targetJid

  // 1️⃣ Si responde a alguien
  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    targetJid = msg.message.extendedTextMessage.contextInfo.participant

  // 2️⃣ Si menciona a alguien
  } else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]

  // 3️⃣ Si no, es él mismo
  } else {
    targetJid = msg.key.participant || msg.key.remoteJid
  }

  const targetUser = global.db.data.users[targetJid]

  if (!targetUser || !targetUser.registered) {
    return reply('_Ese man no está registrado, no se puede ver su balance._')
  }

  const text = `
- _*BALANCE*_ 💰
- _*Usuario:* ${targetUser.name}_
- _*Monedas:* ${targetUser.coins} 🪙_
- _*Diamantes:* ${targetUser.diamonds} 💎_
- _*Nivel:* ${targetUser.level} ⭐_
- _*Exp:* ${targetUser.exp}/${targetUser.level * 100} ✨_
`.trim()

  await reply(text)
}

handler.command = /^(bal|balance|wallet|dinero)$/i
handler.registered = true
handler.group = true

module.exports = handler