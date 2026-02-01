const ECONOMY_DEFAULTS = {
  coins: 0,
  diamonds: 0
}

function ensureEconomy(user) {
  for (const key in ECONOMY_DEFAULTS) {
    if (typeof user[key] !== 'number') {
      user[key] = ECONOMY_DEFAULTS[key]
    }
  }
}

function processEconomy(user, plugin) {
  ensureEconomy(user)

  if (plugin.coins && user.coins < plugin.coins) {
    return `Te faltan monedas 🪙 (${plugin.coins})`
  }

  if (plugin.diamonds && user.diamonds < plugin.diamonds) {
    return `Te faltan diamantes 💎 (${plugin.diamonds})`
  }

  if (plugin.coins) user.coins -= plugin.coins
  if (plugin.diamonds) user.diamonds -= plugin.diamonds

  return null
}

module.exports = {
  processEconomy,
  ensureEconomy
}