require('./schema')
const db = require('./client')

const demoUser = db.prepare('SELECT id FROM users WHERE id = ?').get('user-dinesh-001')
if (!demoUser) require('./seed')

require('../server')
