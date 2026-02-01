const rolesByLevel = [
  { level: 1, role: 'Novato' },
  { level: 5, role: 'Aprendiz' },
  { level: 10, role: 'Experto' },
  { level: 20, role: 'Veterano' },
  { level: 50, role: 'Leyenda' }
]

const getNeedExp = (level) => {
  return 100 + level ** 2 * 20
}

const addExp = (user, amount = 5) => {
  user.exp += amount

  const needExp = getNeedExp(user.level)
  if (user.exp < needExp) return null

  user.level++
  user.exp = 0

  const newRole = rolesByLevel.filter(r => user.level >= r.level).pop()
  if (newRole && user.role !== newRole.role) {
    user.role = newRole.role
    return { levelUp: true, role: newRole.role }
  }

  return { levelUp: true }
}

module.exports = {
  addExp,
  getNeedExp
}