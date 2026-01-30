const handler = async (sock, msg, args, { user, reply }) => {
  const text = `
- _*BALANCE*_ 💰
- _*Monedas:* ${user.coins} 🪙_
- _*Diamantes:* ${user.diamonds} 💎_
- _*Nivel:* ${user.level} ⭐_
- _*Exp:* ${user.exp}/${user.level * 100} ✨_`.trim()

  await reply(text)
}

handler.command = /^(bal|balance|wallet|dinero)$/i
handler.registered = true

module.exports = handler