function validatePlugin({
  plugin,
  user,
  chat,
  settings,
  isGroup,
  isUserAdmin,
  isBotAdmin,
  sender
}) {
  if (!isGroup && settings.antiprivate &&
      !global.config.owner.includes(sender.split('@')[0]))
    return 'Este bot no responde por privado 😴'

  if (plugin.registered && !user.registered)
    return 'Primero regístrate con *.register*, no seas bruto 😑'

  if (plugin.group && !isGroup)
    return 'Este comando es solo pa grupos 🙄'

  if (plugin.owner &&
      !global.config.owner.includes(sender.split('@')[0]))
    return 'Esto es solo pa mi papá 🤨'

  if (plugin.nsfw && !chat.nsfw)
    return 'El nsfw está apagado aquí 💤'

  if (plugin.groupAdmin && !isUserAdmin)
    return 'Solo admins pueden usar este comando 😎'

  if (plugin.botAdmin && !isBotAdmin)
    return 'Necesito ser admin pa poder ejecutar esto 😑'

  return null
}

module.exports = { validatePlugin }