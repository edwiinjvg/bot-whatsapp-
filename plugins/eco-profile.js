const path = require('path')
const fs = require('fs')

// imagen por defecto
const DEFAULT_PFP = path.join(process.cwd(), 'media', 'user.jpg')

const handler = async (sock, msg, args, { user, reply }) => {

  const jidChat = msg.key.remoteJid

  // ======================
  // DETERMINAR USUARIO OBJETIVO
  // ======================
  let targetJid = msg.key.participant // por defecto: el que ejecuta

  const context = msg.message?.extendedTextMessage?.contextInfo

  // si responde un mensaje
  if (context?.participant) {
    targetJid = context.participant
  }

  // si menciona a alguien
  if (context?.mentionedJid?.length) {
    targetJid = context.mentionedJid[0]
  }

  const targetUser = global.db.data.users[targetJid]

  if (!targetUser) {
    return reply('Ese man no existe en la base de datos 💀')
  }

  // ======================
  // FOTO DE PERFIL
  // ======================
  const getProfilePic = async () => {
    try {
      return await sock.profilePictureUrl(targetJid, 'image')
    } catch {
      return null
    }
  }

  // ======================
  // TEXTO PERFIL
  // ======================
  const caption =
`- _*PERFIL DE USUARIO*_ 👤

- _*Nombre:* ${targetUser.name || 'Sin registrar'} 👤_
- _*Edad:* ${targetUser.age ?? 'N/A'} 🎂_
- _*Registrado:* ${targetUser.registered ? 'Sí' : 'No'} 📝_
- _*ID:* ${targetUser.id || 'N/A'} 🆔_
- _*Monedas:* ${targetUser.coins} 🪙_
- _*Diamantes:* ${targetUser.diamonds} 💎_
- _*Exp:* ${targetUser.exp}/${targetUser.level * 100} ✨_
- _*Nivel:* ${targetUser.level} ⭐_`

  const pfp = await getProfilePic()

  let imagePayload = null

  if (pfp) {
    imagePayload = { url: pfp }
  } else if (fs.existsSync(DEFAULT_PFP)) {
    imagePayload = fs.readFileSync(DEFAULT_PFP)
  }

  // ======================
  // RESPUESTA
  // ======================
  if (imagePayload) {
    return sock.sendMessage(
      jidChat,
      { image: imagePayload, caption },
      { quoted: msg }
    )
  } else {
    return reply(caption)
  }
}

handler.command = /^(profile|perfil|me)$/i
handler.registered = true
handler.group = true

module.exports = handler