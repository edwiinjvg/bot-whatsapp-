// --- BOT ---
global.config = {
  bot: {
    name: 'Botsito',
    version: '1.0.0',
    number: '573XXXXXXXXX'
  },
  owner: [
    '573005094862'
  ],
  prefixes: ['.', '!', '#', '/', '?', '*']
}

// --- MENSAJES ---
global.messages = {
  success: '_Listo, papi ✅_',
  error: '_Algo se jodió gg ❌_',
  wait: '_Espérate un momentico ahí… ⏳_'
}

// --- STICKERS ---
global.sticker = {
  packname: 'Botsito',
  author: 'By Edwin'
}

// --- FLAGS ---
global.flags = {
  selfReply: true,   // permitir que el bot se responda
  antiLoop: true    // evitar loops/spam
}

module.exports = {
  config: global.config,
  messages: global.messages,
  sticker: global.sticker,
  flags: global.flags
}