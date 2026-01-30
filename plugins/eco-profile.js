const path = require('path')
const fs = require('fs')

// imagen por defecto
const DEFAULT_PFP = path.join(process.cwd(), 'media', 'user.jpg')

const handler = async (sock, msg, args, { user, reply }) => {

  const jidChat = msg.key.remoteJid
  const isGroup = jidChat.endsWith('@g.us')

  const jidUser = msg.key.participant

  const getProfilePic = async () => {
    try {
      return await sock.profilePictureUrl(jidUser, 'image')
    } catch {
      return null
    }
  }

  // ======================
  // TEXTO PERFIL
  // ======================
  const caption =
`- _*PERFIL DE USUARIO*_ 👤

- _*Nombre:* ${user.name || 'Sin registrar'} 👤_
- _*ID:* ${user.id || 'N/A'} 🆔_
- _*Registrado:* ${user.registered ? 'Sí' : 'No'} 📝_
- _*Nivel:* ${user.level} ⭐_
- _*Exp:* ${user.exp}/${user.level * 100} ✨_
- _*Monedas:* ${user.coins} 🪙_
- _*Diamantes:* ${user.diamonds} 💎_`

  // ======================
  // FOTO DE PERFIL
  // ======================
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