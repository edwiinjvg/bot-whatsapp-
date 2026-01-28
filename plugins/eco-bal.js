const handler = async (sock, msg, args, { user, reply }) => {
  const text = `
- _💰 BALANCE_
- _Monedas: ${user.coins} 🪙_
- _Diamantes: ${user.diamonds} 💎_
- _Nivel: ${user.level} ⭐_
- _Exp: ${user.exp}/${user.level * 100} ✨_
`.trim()

  await reply(text)
}

handler.command = /^(bal|balance|wallet|dinero)$/i
handler.registered = true

module.exports = handler