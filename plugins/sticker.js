const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')

async function handler(sock, msg, args, { reply }) {
  const jid = msg.key.remoteJid

  let media
  let type

  // Imagen o video directo
  if (msg.message.imageMessage) {
    media = msg.message.imageMessage
    type = 'image'
  } else if (msg.message.videoMessage) {
    media = msg.message.videoMessage
    type = 'video'
  }

  // Imagen o video respondido
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!media && quoted) {
    if (quoted.imageMessage) {
      media = quoted.imageMessage
      type = 'image'
    } else if (quoted.videoMessage) {
      media = quoted.videoMessage
      type = 'video'
    }
  }

  if (!media) {
    return reply('_Manda o responde a una imagen o video pa hacer sticker._')
  }

  if (type === 'video' && media.seconds > 10) {
    return reply('_El video es muy largo, máx 10s._')
  }

  const tmpDir = './tmp'
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const inputPath = path.join(tmpDir, `${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`)
  const outputPath = path.join(tmpDir, `${Date.now()}.webp`)

  // Descargar media
  const stream = await downloadContentFromMessage(media, type)
  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  fs.writeFileSync(inputPath, buffer)

  // Comando ffmpeg
  const ffmpegCmd =
    type === 'image'
      ? `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 10 -preset default -an -vsync 0 ">
      : `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -t 10 -an -preset default "${outputPath}"`

  exec(ffmpegCmd, async (err) => {
    if (err) {
      console.error(err)
      return reply('_Error creando el sticker._')
    }

    const stickerBuffer = fs.readFileSync(outputPath)

    await sock.sendMessage(
      jid,
      { sticker: stickerBuffer },
      { quoted: msg }
    )

    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)
  })
}

handler.command = /^(s|sticker)$/i

module.exports = handler