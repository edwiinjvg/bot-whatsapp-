console.log(require('./lib/jid'))
const fs = require('fs')
const path = require('path')

const {
  loadDatabase,
  saveDatabase,
  initUser,
  initChat,
  initSettings
} = require('./lib/database')

const { logMessage } = require('./lib/logMessage')
const { addExp } = require('./lib/level')
const { normalizeUserJid } = require('./lib/jid')
const { getAdmins } = require('./lib/permissions')
const { validatePlugin } = require('./lib/pluginValidator')
const { processEconomy } = require('./lib/economy')

module.exports = async function handler(sock, msg) {
  try {
    if (!msg.message) return

    loadDatabase()

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const sender = normalizeUserJid(msg)
    if (!sender) return

    const botJid = sock.user.id

    initSettings(botJid)
    initUser(sender)
    initChat(from)

    const user = global.db.data.users[sender]
    const chat = global.db.data.chats[from]
    const settings = global.db.data.settings[botJid]

    const { isBotAdmin, isUserAdmin } =
      await getAdmins(sock, from, sender, botJid)

    const reply = (txt, extra = {}) =>
      sock.sendMessage(from, { text: txt, ...extra }, { quoted: msg })

    if (settings.autoread)
      await sock.readMessages([msg.key])

    await logMessage(msg, sock)

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    if (!body) return

    const text = body.trim()
    const prefix = global.config.prefixes.find(p => text.startsWith(p))
    if (!prefix) return

    const args = text.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    const pluginFiles = fs
      .readdirSync(path.join(__dirname, 'plugins'))
      .filter(f => f.endsWith('.js'))

    let plugin = null

    for (const file of pluginFiles) {
      const filePath = path.join(__dirname, 'plugins', file)
      delete require.cache[require.resolve(filePath)]
      const temp = require(filePath)
      if (temp.command?.test(command)) {
        plugin = temp
        break
      }
    }

    if (!plugin) return

    const error = validatePlugin({
      plugin,
      user,
      chat,
      settings,
      isGroup,
      isUserAdmin,
      isBotAdmin,
      sender
    })

    if (error) return reply(error)

    // ECONOMÍA
    const ecoError = processEconomy(user, plugin)
    if (ecoError) return reply(ecoError)

    // EXP / LEVEL
    if (settings.autolevelup) {
      const result = addExp(user, plugin.exp ?? 5)
      if (result?.levelUp) {
        await reply(`🔥 Subiste a nivel ${user.level}`)
        if (result.role)
          await reply(`🎉 Nuevo rol: ${result.role}`)
      }
    }

    // COOLDOWN
    if (plugin.cooldown) {
      const now = Date.now()
      const last = user[plugin.cooldown.key] || 0
      const diff = plugin.cooldown.time - (now - last)
      if (diff > 0)
        return reply(`Espera ${Math.ceil(diff / 1000)}s 😴`)
      user[plugin.cooldown.key] = now
    }

    await plugin(sock, msg, args, {
      user,
      chat,
      settings,
      reply,
      command
    })

    saveDatabase()
  } catch (e) {
    console.error('❌ Error handler:', e)
  }
}