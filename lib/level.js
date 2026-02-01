// ======================
// ROLES POR NIVEL
// ======================
const rolesByLevel = [
  { level: 1, role: 'Novato' },
  { level: 5, role: 'Aprendiz' },
  { level: 10, role: 'Experto' },
  { level: 20, role: 'Veterano' },
  { level: 50, role: 'Leyenda' }
]

// ======================
// DEFAULTS DE NIVEL
// ======================
const LEVEL_DEFAULTS = {
  exp: 0,
  level: 1,
  role: 'Novato'
}

// ======================
// ASEGURAR DATOS DE NIVEL
// ======================
function ensureLevelData(user) {
  for (const key in LEVEL_DEFAULTS) {
    if (user[key] === undefined || user[key] === null) {
      user[key] = LEVEL_DEFAULTS[key]
    }
  }
}

// ======================
// EXP NECESARIA
// ======================
function getNeedExp(level) {
  return 100 + level ** 2 * 20
}

// ======================
// AÑADIR EXP
// ======================
function addExp(user, amount = 5) {
  ensureLevelData(user)

  user.exp += amount

  const needExp = getNeedExp(user.level)
  if (user.exp < needExp) return null

  user.level++
  user.exp = 0

  const newRole = rolesByLevel
    .filter(r => user.level >= r.level)
    .pop()

  let roleChanged = false

  if (newRole && user.role !== newRole.role) {
    user.role = newRole.role
    roleChanged = true
  }

  return {
    levelUp: true,
    role: roleChanged ? user.role : null
  }
}

module.exports = {
  addExp,
  getNeedExp,
  ensureLevelData
}