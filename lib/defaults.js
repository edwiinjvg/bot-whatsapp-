const userDefaults = {
  coins: 500,
  diamonds: 5,
  exp: 0,
  level: 1,
  role: 'Novato'
}

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

function applyDefaults(target, defaults) {
  for (const key in defaults) {
    if (target[key] === undefined || target[key] === null) {
      target[key] = defaults[key]
    }
  }
}

module.exports = {
  userDefaults,
  chatDefaults,
  applyDefaults
}