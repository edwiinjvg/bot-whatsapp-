const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

// imagen por defecto LOCAL
const DEFAULT_PFP = path.join(process.cwd(), 'media', 'user.jpg')

async function handler(sock, msg, args, { user, command, reply }) {

  // ======================
  // CONTEXTO (SOLO GRUPOS)
  // ======================
  const jidChat = msg.key.remoteJid
  const jidUser = msg.key.participant

  const generateID = () => crypto.randomBytes(6).toString('hex')

  const getProfilePic = async () => {
    try {
      return await sock.profilePictureUrl(jidUser, 'image')
    } catch {
      return null
    }
  }

  switch (command) {

    // ======================
    // REGISTRO
    // ======================
    case 'reg':
    case 'register':
    case 'registrar': {

      if (user.registered)
        return reply('_Ya estás registrado, gei_')

      const text = args.join(' ').trim()
      if (!text)
        return reply(`_Usa *.${command} <nombre> <edad>* para registrarte._`)

      const parts = text.split(/\s+/)
      const age = Number(parts.pop())
      const nameRaw = parts.join(' ')

      if (!nameRaw)
        return reply('_El nombre no puede ir vacío._')

      if (nameRaw.length > 10)
        return reply('_Ese nombre está muy largo._')

      if (!Number.isInteger(age) || age < 12 || age > 30)
        return reply('_Ponte una edad seria, imbécil._')

      const firstTime = !user.hasRegisteredBefore

      user.registered = true
      user.name = nameRaw
      user.age = age
      user.id = generateID()

      user.coins ||= 0
      user.diamonds ||= 0

      if (firstTime) {
        user.coins += 500
        user.diamonds += 5
        user.hasRegisteredBefore = true
      }

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

      const caption =
`_*REGISTRO EXITOSO*_ ✅

- _*Nombre:* ${nameRaw}_ 👤
- _*Edad:* ${age}_ ⏳
- _*ID:* ${user.id}_ 🆔

${firstTime
  ? '_*RECOMPENSA:*_ 🎁\n- _*+500* monedas_ 🪙\n- _*+5* diamantes 💎_'
  : '_Ya reclamaste tu recompensa antes._'}

_Usa *.id* para ver tu ID_`

      return sock.sendMessage(
        jidChat,
        imagePayload
          ? { image: imagePayload, caption }
          : { text: caption },
        { quoted: msg }
      )
    }

    // ======================
    // VER ID
    // ======================
    case 'id':
    case 'myid': {

      if (!user.registered || !user.id)
        return reply('_No estás registrado todavía, animal._')

      return reply(user.id)
    }

    // ======================
    // ANULAR REGISTRO
    // ======================
    case 'unreg':
    case 'unregister':
    case 'anular': {

      if (!user.registered)
        return reply('_Tú ni estás registrado, qué vas a anular? XD_')

      const inputID = args[0]
      if (!inputID)
        return reply(`_Usa *.${command} <ID>* para anular tu registro._`)

      if (inputID !== user.id)
        return reply('_Ese no es tu ID, bobo hijueputa_')

      user.registered = false
      user.name = null
      user.age = null
      user.id = null

      return reply('_Registro anulado, te fuiste del sistema._ 👏')
    }
  }
}

handler.command = /^(reg|register|registrar|unreg|unregister|anular|id|myid)$/i
handler.group = true
module.exports = handler