const fs = require('fs')
const path = require('path')
const {
  loadDatabase,
  saveDatabase,
  initUser,
  initChat,
  initSettings
} = require('./lib/database')

// ======================
// NORMALIZAR JID (CLAVE GLOBAL)
// ======================
function normalizeUserJid(msg) {
  let jid = msg.key.participant || msg.key.remoteJid

  // si por alguna razón viene el jid del grupo
  if (jid.endsWith('@g.us')) {
    jid = msg.key.participant
  }

  if (!jid) return null

  return jid
    .replace(/@c\.us$/, '@s.whatsapp.net')
    .replace(/:\d+@/, '@')
}

module.exports = async function handler(sock, msg) {
  try {
    if (!msg.message) return

    // ======================
    // DB
    // ======================
    loadDatabase()

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')

    const sender = normalizeUserJid(msg)
    if (!sender) return

    const isFromMe = msg.key.fromMe
    const botJid = sock.user.id

    initSettings(botJid)

    if (isFromMe && !global.flags.selfReply) return

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

    console.log(`⚙️ CMD: ${command} | ${sender}`)

    // ======================
    // INIT USER / CHAT
    // ======================
    initUser(sender)
    initChat(from)

    const user = global.db.data.users[sender]
    const chat = global.db.data.chats[from]
    const settings = global.db.data.settings[botJid]

    // ======================
    // REPLY HELPER
    // ======================
    const reply = async (txt, extra = {}) => {
      return sock.sendMessage(
        from,
        { text: txt, ...extra },
        { quoted: msg }
      )
    }

    // ======================
    // AUTOREAD
    // ======================
    if (settings.autoread) {
      await sock.readMessages([msg.key])
    }

    // ======================
    // CARGAR PLUGINS
    // ======================
    const pluginFiles = fs
      .readdirSync(path.join(__dirname, 'plugins'))
      .filter(file => file.endsWith('.js'))

    let plugin
    for (const file of pluginFiles) {
      const filePath = path.join(__dirname, 'plugins', file)
      delete require.cache[require.resolve(filePath)]
      const temp = require(filePath)
      if (temp.command && temp.command.test(command)) {
        plugin = temp
        break
      }
    }

    if (!plugin) return

    // ======================
    // VALIDACIONES
    // ======================
    if (!isGroup && settings.antiprivate) {
      if (!global.config.owner.includes(sender.split('@')[0])) return
    }

    if (plugin.registered && !user.registered) {
      return reply('Primero regístrate con *.register*, no seas bruto 😑')
    }

    if (plugin.group && !isGroup) {
      return reply('Este comando es solo pa grupos 🙄')
    }

    if (plugin.owner && !global.config.owner.includes(sender.split('@')[0])) {
      return reply('Esto es solo pa mi papá 🤨')
    }

    if (plugin.nsfw && !chat.nsfw) {
      return reply('El nsfw está apagado aquí 💤')
    }

    // ======================
    // ECONOMÍA
    // ======================
    if (plugin.coins && user.coins < plugin.coins) {
      return reply(`Te faltan monedas 🪙 (${plugin.coins})`)
    }
    if (plugin.diamonds && user.diamonds < plugin.diamonds) {
      return reply(`Te faltan diamantes 💎 (${plugin.diamonds})`)
    }

    if (plugin.coins) user.coins -= plugin.coins
    if (plugin.diamonds) user.diamonds -= plugin.diamonds

    // ======================
    // COOLDOWNS
    // ======================
    const now = Date.now()

    if (plugin.cooldown) {
      const last = user[plugin.cooldown.key] || 0
      const diff = plugin.cooldown.time - (now - last)
      if (diff > 0) {
        return reply(`Espera ${Math.ceil(diff / 1000)}s pa usar este comando otra vez 😴`)
      }
      user[plugin.cooldown.key] = now
    }

    // ======================
    // EXP / LEVEL
    // ======================
    user.exp += typeof plugin.exp === 'number' ? plugin.exp : 5
    const needExp = 100 + (user.level ** 2 * 20)

    if (user.exp >= needExp) {
      user.level++
      user.exp = 0
      await reply(`🔥 Subiste a nivel ${user.level}`)
    }

    // ======================
    // EJECUTAR PLUGIN
    // ======================
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