const crypto = require('crypto')

async function handler(sock, msg, args, { user, command }) {

  const jid = msg.key.remoteJid

  const generateID = () => crypto.randomBytes(4).toString('hex')

  const getProfilePic = async () => {
    try {
      return await sock.profilePictureUrl(
        msg.key.participant || msg.key.remoteJid,
        'image'
      )
    } catch {
      return null
    }
  }

  /* ======================
     REGISTRO
  ====================== */
  if (/^(reg|register|registrar)$/i.test(command)) {

    if (user.registered) {
      return sock.sendMessage(
        jid,
        { text: '_Ya estás registrado, deja la joda 😑_' },
        { quoted: msg }
      )
    }

    const text = args.join(' ').trim()
    if (!text || !text.includes('|')) {
      return sock.sendMessage(
        jid,
        { text: `_Usa .${command} TuNombre | Edad_` },
        { quoted: msg }
      )
    }

    const [nameRaw, ageRaw] = text.split('|').map(v => v.trim())
    const age = parseInt(ageRaw)

    if (!nameRaw)
      return sock.sendMessage(jid, { text: '_El nombre no puede ir vacío_' }, { quoted: msg })

    if (nameRaw.length > 25)
      return sock.sendMessage(jid, { text: '_Ese nombre está muy largo_' }, { quoted: msg })

    if (!age || age < 10 || age > 90)
      return sock.sendMessage(jid, { text: '_Esa edad no cuadra, man_' }, { quoted: msg })

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

Nombre: ${nameRaw}
Edad: ${age}
ID: ${user.id}

${firstTime
  ? 'Recompensa:\n+500 monedas 🪙\n+5 diamantes 💎'
  : 'Ya habías reclamado la recompensa antes'}

_Usa .myid si se te olvida el ID_`
      },
      { quoted: msg }
    )
  }

  /* ======================
     VER ID
  ====================== */
  if (/^(id|myid)$/i.test(command)) {

    if (!user.registered || !user.id) {
      return sock.sendMessage(
        jid,
        { text: '_No estás registrado todavía, animal_' },
        { quoted: msg }
      )
    }

    return sock.sendMessage(
      jid,
      { text: `_Tu ID es: *${user.id}*\nGuárdalo bien_` },
      { quoted: msg }
    )
  }

  /* ======================
     ANULAR REGISTRO
  ====================== */
  if (/^(unreg|unregister|anular)$/i.test(command)) {

    if (!user.registered) {
      return sock.sendMessage(
        jid,
        { text: '_Tú ni estás registrado, qué vas a anular XD_' },
        { quoted: msg }
      )
    }

    const inputID = args[0]
    if (!inputID) {
      return sock.sendMessage(
        jid,
        { text: `_Usa .${command} TuID_` },
        { quoted: msg }
      )
    }

    if (inputID !== user.id) {
      return sock.sendMessage(
        jid,
        { text: '_Ese ID no coincide, pilas_' },
        { quoted: msg }
      )
    }

    user.registered = false
    user.name = null
    user.age = null
    user.id = null

    return sock.sendMessage(
      jid,
      { text: '_Registro anulado. Te saliste del sistema 👋_' },
      { quoted: msg }
    )
  }
}

handler.command = /^(reg|register|registrar|unreg|unregister|anular|id|myid)$/i
handler.exp = 0

module.exports = handler