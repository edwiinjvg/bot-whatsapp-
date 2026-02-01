const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const P = require('pino')
const readline = require('readline')

// CONFIG
require('./config')

// DB
const { loadDatabase, saveDatabase, initSettings } = require('./lib/database')

// HANDLER
const handler = require('./handler')

// EVENTOS
const welcomeEvent = require('./lib/events/welcome')
const antideleteEvent = require('./lib/events/antidelete')

async function startBot() {
  loadDatabase()

  const { state, saveCreds } = await useMultiFileAuthState('./auth')

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' })
  })

  initSettings(sock.user?.id || 'bot')
  sock.ev.on('creds.update', saveCreds)

  setInterval(() => saveDatabase(), 30_000)

  // ======================
  // MENSAJES
  // ======================
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg) return

    // Guardar mensaje para antidelete
    antideleteEvent.storeMessage(msg)

    // Pasar al handler
    await handler(sock, msg)
  })

  // ======================
  // WELCOME / DESPEDIDAS
  // ======================
  sock.ev.on('group-participants.update', async (update) => {
    await welcomeEvent(sock, update)
  })

  // ======================
  // ANTIDELETE
  // ======================
  sock.ev.on('messages.update', async (updates) => {
    await antideleteEvent(sock, updates)
  })

  // ======================
  // VINCULACIÓN POR CÓDIGO
  // ======================
  if (!state.creds.registered) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(
      'Escribe tu número con indicativo (ej: 573001234567): ',
      async (number) => {
        const code = await sock.requestPairingCode(number)
        console.log('\nCódigo de vinculación:\n', code)
        rl.close()
      }
    )
  }

  // ======================
  // CONEXIÓN
  // ======================
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }

    if (connection === 'open') {
      console.log('Bot conectado correctamente ✅')
    }
  })
}

startBot()