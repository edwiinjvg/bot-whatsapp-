const crypto = require('crypto')

async function handler(sock, msg, args, { user, command, reply }) {
  const jid = msg.key.remoteJid
  const jidUser = msg.key.participant || msg.key.remoteJid

  const generateID = () => crypto.randomBytes(6).toString('hex')

  const getProfilePic = async () => {
    try {
      return await sock.profilePictureUrl(jidUser, 'image')
    } catch {
      return null
    }
  }

  // REGISTRO
  if (/^(reg|register|registrar)$/i.test(command)) {
    if (user.registered)
      return reply('_Ya estás registrado gei_')

    const text = args.join(' ').trim()
    if (!text || !text.includes('|'))
      return reply(`_Usa .${command} <nombre | <edad> para registrarte._`)

    const [nameRaw, ageRaw] = text.split('|').map(v => v.trim())
    const age = Number(ageRaw)

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

    if (firstTime) {
      user.coins += 500
      user.diamonds = (user.diamonds || 0) + 5
      user.hasRegisteredBefore = true
    }

    const pfp = await getProfilePic()

    return sock.sendMessage(
      jid,
      {
        image: pfp ? { url: pfp } : undefined,
        text:
`_*REGISTRO EXITOSO*_ ✅

- _Nombre: ${nameRaw}_
- _Edad: ${age}_
- _ID: ${user.id}_

${firstTime
  ? 'Recompensa:\n+500 monedas 🪙\n+5 diamantes 💎'
  : 'Ya habías reclamado la recompensa antes'}

_Usa .myid si se te olvida el ID_`
      },
      { quoted: msg }
    )
  }

  // VER ID
  if (/^(id|myid)$/i.test(command)) {
    if (!user.registered || !user.id)
      return reply('_No estás registrado todavía, animal._')

    return reply(`_Tu ID es: *${user.id}*, guárdalo bien._`)
  }

  // ANULAR REGISTRO
  if (/^(unreg|unregister|anular)$/i.test(command)) {
    if (!user.registered)
      return reply('_Tú ni estás registrado, qué vas a anular? XD_')

    const inputID = args[0]
    if (!inputID)
      return reply(`_Usa .${command} <ID> para anular tu registro._`)

    if (inputID !== user.id)
      return reply('_Ese no es tu ID, bobo  hijueputa_')

    user.registered = false
    user.name = null
    user.age = null
    user.id = null

    return reply('_Registro anulado._ ✅')
  }
}

handler.command = /^(reg|register|registrar|unreg|unregister|anular|id|myid)$/i

module.exports = handler