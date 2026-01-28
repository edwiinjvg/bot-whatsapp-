const handler = async (sock, msg, args, { user, reply }) => {
  const text = 
`- _PERFIL DE USUARIO 👤_
- _Nombre: ${user.name || 'Sin registrar'} 📛_
- _Registrado: ${user.registered ? 'Sí' : 'No'} 📌_
- _Nivel: ${user.level} ⭐_
- _Exp: ${user.exp}/${user.level * 100} ✨_
- _Monedas: ${user.coins} 🪙_
- _Diamantes: ${user.diamonds} 💎_`

  await reply(text)
}

handler.command = /^(profile|perfil|me)$/i
handler.registered = true

module.exports = handler