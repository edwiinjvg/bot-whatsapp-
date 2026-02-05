// lib/helpers/ui.js

function invisibleLink(url) {
  return `\u200e${url}`
}

function buildExternalAdReply({
  title = '',
  body = '',
  thumbnailUrl,
  sourceUrl
}) {
  return {
    showAdAttribution: true,
    renderLargerThumbnail: true,
    title,
    body,
    mediaType: 1,
    sourceUrl,
    thumbnailUrl
  }
}

module.exports = {
  invisibleLink,
  buildExternalAdReply
}