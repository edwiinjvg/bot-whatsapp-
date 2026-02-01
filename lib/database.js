const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(process.cwd(), 'database', 'database.json')

// DB base limpia
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

// ======================
// LOAD
// ======================
function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    global.db.data = freshDB()
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2))
    return
  }

  try {
    const raw = fs.readFileSync(DB_PATH)
    global.db.data = JSON.parse(raw)
  } catch (err) {
    console.error('❌ Database corrupta, creando nueva')
    global.db.data = freshDB()
    fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2))
  }
}

// ======================
// SAVE
// ======================
function saveDatabase() {
  if (!global.db?.data) return
  fs.writeFileSync(DB_PATH, JSON.stringify(global.db.data, null, 2))
}

// ======================
// INIT USER
// ======================
function initUser(jid) {
  if (!global.db.data.users[jid]) {
    global.db.data.users[jid] = {
      // registro
      registered: false,
      name: null,
      age: null,
      id: null,

      // estado general
      banned: false,
      spam: 0,

      // cooldowns (timestamps)
      lastDaily: 0,
      lastMine: 0,
      lastWork: 0
    }
  }
}

// ======================
// INIT CHAT
// ======================
function initChat(jid) {
  if (!global.db.data.chats[jid]) {
    global.db.data.chats[jid] = {}
  }
}

// ======================
// INIT SETTINGS
// ======================
function initSettings(botJid) {
  if (!global.db.data.settings[botJid]) {
    global.db.data.settings[botJid] = {}
  }
}

module.exports = {
  loadDatabase,
  saveDatabase,
  initUser,
  initChat,
  initSettings
}