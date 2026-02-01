const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(process.cwd(), 'database', 'database.json')

// ======================
// DB BASE
// ======================
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

      // estado
      banned: false,
      spam: 0,

      // cooldowns
      lastDaily: 0,
      lastMine: 0,
      lastWork: 0
    }
    return
  }

  const defaults = {
    registered: false,
    name: null,
    age: null,
    id: null,
    banned: false,
    spam: 0,
    lastDaily: 0,
    lastMine: 0,
    lastWork: 0
  }

  const user = global.db.data.users[jid]

  for (const key in defaults) {
    if (user[key] === undefined) {
      user[key] = defaults[key]
    }
  }
}

// ======================
// INIT CHAT
// ======================
function initChat(jid) {
  if (!global.db.data.chats[jid]) {
    global.db.data.chats[jid] = {
      nsfw: false,
      welcome: true,
      detect: false,
      antidelete: false,
      antiviewonce: false,
      antispam: false
    }
    return
  }

  const defaults = {
    nsfw: false,
    welcome: true,
    detect: false,
    antidelete: false,
    antiviewonce: false,
    antispam: false
  }

  const chat = global.db.data.chats[jid]

  for (const key in defaults) {
    if (typeof chat[key] !== 'boolean') {
      chat[key] = defaults[key]
    }
  }
}

// ======================
// INIT SETTINGS
// ======================
function initSettings(botJid) {
  if (!global.db.data.settings[botJid]) {
    global.db.data.settings[botJid] = {
      self: false,
      autoread: false,
      restrict: false,
      antiprivate: false,
      anticall: true,
      antispam: true,
      autolevelup: true
    }
    return
  }

  const defaults = {
    self: false,
    autoread: false,
    restrict: false,
    antiprivate: false,
    anticall: true,
    antispam: true,
    autolevelup: true
  }

  const settings = global.db.data.settings[botJid]

  for (const key in defaults) {
    if (typeof settings[key] !== typeof defaults[key]) {
      settings[key] = defaults[key]
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