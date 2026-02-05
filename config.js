// --- BOT ---
global.config = {
  bot: {
    name: 'Botsito',
    version: '1.0.0',
    number: '573001181148'
  },
  owner: {
    name: 'Edwin',
    number: '573005094862',
  },
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

// --- LINKS GLOBALES (para links invisibles, previews, etc) ---
global.links = {
  socials: [
    'https://instagram.com/edwinnjvg',
    'https://tiktok.com/edwinjvg'
  ],
  group: [
    'https://chat.whatsapp.com/DAhJ6NbqwgG7YjuMZuYsZ3'
  ],
  all: [
    'https://instagram.com/edwinnjvg',
    'https://tiktok.com/edwinjvg',
    'https://chat.whatsapp.com/DAhJ6NbqwgG7YjuMZuYsZ3'
  ]
}

module.exports = {
  config: global.config,
  messages: global.messages,
  sticker: global.sticker,
  links: global.links
}