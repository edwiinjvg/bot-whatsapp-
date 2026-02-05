function invisibleLink(url = 'https://wa.me/') {
  return url.replace(
    /^https?:\/\//,
    match => match[0] + '\u200b' + match.slice(1)
  )
}
function fakeQuoted(jid, text = '‎', participant = '0@s.whatsapp.net') {
  return {
    key: {
      remoteJid: jid,
      fromMe: false,
      id: 'FAKE_' + Date.now(),
      participant
    },
    message: {
      conversation: text
    }
  }
}

async function editMessage(sock, jid, key, newText) {
  return sock.sendMessage(jid, {
    text: newText,
    edit: key
  })
}

module.exports = {
  invisibleLink,
  fakeQuoted,
  editMessage
}