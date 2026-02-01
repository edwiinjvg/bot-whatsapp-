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

// ======================
// NORMALIZAR JID
// ======================
function normalizeUserJid(msg) {
  let jid = msg.key.participant || msg.key.remoteJid
  if (jid.endsWith('@g.us')) jid = msg.key.participant
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/:\d+@/, '@')
}

// ======================
// VALORES INICIALES USUARIO
// ======================
const userDefaults = {
  coins: 500,
  diamonds: 5,
  exp: 0,
  level: 1,
  role: 'Novato'
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
    const botJid = sock.user.id

    initSettings(botJid)
    initUser(sender)
    initChat(from)

    const user = global.db.data.users[sender]
    const chat = global.db.data.chats[from]
    const settings = global.db.data.settings[botJid]

    // ======================
    // DEFAULTS USUARIO
    // ======================
    for (const key in userDefaults) {
      if (user[key] === undefined || user[key] === null) {
        user[key] = userDefaults[key]
      }
    }

    // ======================
    // FLAGS CHAT / SETTINGS
    // ======================
    if (typeof settings.autolevelup !== 'boolean') settings.autolevelup = true

    const chatDefaults = {
      antilink: false,
      autosticker: false,
      autoaudio: false,
      autoresponse: false,
      antidelete: false,
      antiviewonce: false,
      welcome: true,
      detect: false,
      nsfw: false,
      simi: false,
      antispam: false
    }

    for (const key in chatDefaults) {
      if (typeof chat[key] !== 'boolean') chat[key] = chatDefaults[key]
    }

    // ======================
    // ADMINS
    // ======================
    let isBotAdmin = false
    let isUserAdmin = false

    if (isGroup) {
      const metadata = await sock.groupMetadata(from)
      const participants = metadata.participants

      isBotAdmin = participants.some(
        p => p.id === botJid && (p.admin || p.superAdmin)
      )

      isUserAdmin = participants.some(
        p => p.id === sender && (p.admin || p.superAdmin)
      )
    }

    // ======================
    // REPLY HELPER
    // ======================
    const reply = async (txt, extra = {}) =>
      sock.sendMessage(from, { text: txt, ...extra }, { quoted: msg })

    // ======================
    // AUTOREAD
    // ======================
    if (settings.autoread) {
      await sock.readMessages([msg.key])
    }

    // ======================
    // LOG
    // ======================
    await logMessage(msg, sock)

    // ======================
    // TEXTO / COMANDO
    // ======================
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

    // ======================
    // CARGAR PLUGINS
    // ======================
    const pluginFiles = fs
      .readdirSync(path.join(__dirname, 'plugins'))
      .filter(file => file.endsWith('.js'))

    let plugin = null

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
    if (!isGroup && settings.antiprivate &&
        !global.config.owner.includes(sender.split('@')[0])) return

    if (plugin.registered && !user.registered)
      return reply('Primero regístrate con *.register*, no seas bruto 😑')

    if (plugin.group && !isGroup)
      return reply('Este comando es solo pa grupos 🙄')

    if (plugin.owner &&
        !global.config.owner.includes(sender.split('@')[0]))
      return reply('Esto es solo pa mi papá 🤨')

    if (plugin.nsfw && !chat.nsfw)
      return reply('El nsfw está apagado aquí 💤')

    if (plugin.groupAdmin && !isUserAdmin)
      return reply('Solo admins pueden usar este comando 😎')

    if (plugin.botAdmin && !isBotAdmin)
      return reply('Necesito ser admin pa poder ejecutar esto 😑')

    // ======================
    // ECONOMÍA
    // ======================
    if (plugin.coins && user.coins < plugin.coins)
      return reply(`Te faltan monedas 🪙 (${plugin.coins})`)

    if (plugin.diamonds && user.diamonds < plugin.diamonds)
      return reply(`Te faltan diamantes 💎 (${plugin.diamonds})`)

    if (plugin.coins) user.coins -= plugin.coins
    if (plugin.diamonds) user.diamonds -= plugin.diamonds

    // ======================
    // EXP / LEVEL (USANDO level.js)
    // ======================
    if (settings.autolevelup) {
      const result = addExp(
        user,
        typeof plugin.exp === 'number' ? plugin.exp : 5
      )

      if (result?.levelUp) {
        await reply(`🔥 Subiste a nivel ${user.level}`)
        if (result.role) {
          await reply(`🎉 Nuevo rol: ${result.role}`)
        }
      }
    }

    // ======================
    // COOLDOWNS
    // ======================
    const now = Date.now()

    if (plugin.cooldown) {
      const last = user[plugin.cooldown.key] || 0
      const diff = plugin.cooldown.time - (now - last)

      if (diff > 0) {
        return reply(
          `Espera ${Math.ceil(diff / 1000)}s pa usar este comando otra vez 😴`
        )
      }

      user[plugin.cooldown.key] = now
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