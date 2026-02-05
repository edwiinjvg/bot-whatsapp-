// lib/helpers/ui.js

function pickRandom(arr = []) {
  if (!Array.isArray(arr) || !arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildAdReply({
  title = '',
  body = '',
  thumbnailUrl,
  sourceUrl,
  renderLargerThumbnail = true
} = {}) {
  if (!sourceUrl) return {}

  return {
    contextInfo: {
      forwardingScore: 999999,
      isForwarded: true,
      externalAdReply: {
        showAdAttribution: true,
        renderLargerThumbnail,
        mediaType: 1,
        title,
        body,
        thumbnailUrl,
        sourceUrl
      }
    }
  }
}

module.exports = {
  pickRandom,
  buildAdReply
}