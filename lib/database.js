const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '../database.json')

// Crear DB fresca (evita bugs por referencia)
function freshDB() {
  return {
    users: {},
    chats: {},
    settings: {}
  }
}

global.db = {
  data: freshDB()
}

// Cargar base de datos
function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const data = freshDB()
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    global.db.data = data
    return global.db.data
  }

  try {
    const raw = fs.readFileSync(DB_PATH)
    global.db.data = JSON.parse(raw)
  } catch (e) {
    console.error('❌ Error leyendo database.json, creando uno nuevo')
    const data = freshDB()
    global.db.data = data
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  }

  return global.db.data
}

// Guardar base de datos
function saveDatabase() {
  if (!global.db || !global.db.data) return
  fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2))
}

// Inicializar usuario
function initUser(jid) {
  if (!global.db.data.users[jid]) {
    global.db.data.users[jid] = {
      registered: false,
      name: null,

      exp: 0,
      level: 1,

      coins: 0,
      diamonds: 0,

      // cooldowns economía
      lastDaily: 0,
      lastMineCoins: 0,
      lastMineDiamonds: 0,
      lastMineExp: 0,

      spam: 0,
      banned: false
    }
  }
}

// Inicializar chat
function initChat(jid) {
  if (!global.db.data.chats[jid]) {
    global.db.data.chats[jid] = {
      isBanned: false,
      nsfw: false,
      welcome: true,
      detect: false,
      game: true,
      viewonce: false
    }
  }
}

// Inicializar settings globales del bot
function initSettings(botJid) {
  if (!global.db.data.settings[botJid]) {
    global.db.data.settings[botJid] = {
      self: false,
      autoread: false,
      restrict: false,
      antiprivate: false,
      anticall: true,
      antispam: true
    }
  }
}

module.exports = {
  loadDatabase,
  saveDatabase,
  initUser,
  initChat,
  initSettings
}