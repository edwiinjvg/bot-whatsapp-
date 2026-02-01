const fs = require('fs')
const path = require('path')

const dbDir = path.join(__dirname, 'database')
const dbPath = path.join(dbDir, 'database.json')

// ======================
// BASE
// ======================
function freshDb() {
  return {
    users: {},
    chats: {},
    settings: {}
  }
}

global.db = {
  data: freshDb()
}

// ======================
// LOAD
// ======================
function loadDatabase() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  if (!fs.existsSync(dbPath)) {
    global.db.data = freshDb()
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2))
    return
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf-8')
    global.db.data = JSON.parse(raw)
  } catch (err) {
    console.error('❌ Database corrupta, creando nueva')
    global.db.data = freshDb()
    fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2))
  }
}

// ======================
// SAVE
// ======================
function saveDatabase() {
  if (!global.db?.data) return
  fs.writeFileSync(dbPath, JSON.stringify(global.db.data, null, 2))
}

// ======================
// HELPERS
// ======================
function applyDefaults(target, defaults) {
  for (const key in defaults) {
    if (target[key] === undefined) {
      target[key] = defaults[key]
    }
  }
}

// ======================
// INIT USER
// ======================
function initUser(jid) {
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

  if (!global.db.data.users[jid]) {
    global.db.data.users[jid] = { ...defaults }
    return
  }

  applyDefaults(global.db.data.users[jid], defaults)
}

// ======================
// INIT CHAT
// ======================
function initChat(jid) {
  const defaults = {
    nsfw: false,
    welcome: true,
    detect: false,
    antidelete: false,
    antiviewonce: false,
    antispam: false
  }

  if (!global.db.data.chats[jid]) {
    global.db.data.chats[jid] = { ...defaults }
    return
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
  const defaults = {
    self: false,
    autoread: false,
    restrict: false,
    antiprivate: false,
    anticall: true,
    antispam: true,
    autolevelup: true
  }

  if (!global.db.data.settings[botJid]) {
    global.db.data.settings[botJid] = { ...defaults }
    return
  }

  applyDefaults(global.db.data.settings[botJid], defaults)
}

module.exports = {
  loadDatabase,
  saveDatabase,
  initUser,
  initChat,
  initSettings
}