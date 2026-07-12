/**
 * db/client.js — SQLite database client (dev)
 *
 * Uses node:sqlite — built into Node.js 22.5+ (available in Node 26).
 * Zero npm packages required for the database layer.
 *
 * To migrate to PostgreSQL for production:
 *   1. Replace this file with a `pg` Pool client
 *   2. Change all db.prepare().run/get/all to pool.query()
 * Everything else in the codebase stays the same.
 */
const { DatabaseSync } = require('node:sqlite')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

let DB_PATH = process.env.DB_PATH || path.join(__dirname, 'peni.db')
if (DB_PATH && !path.isAbsolute(DB_PATH)) {
  DB_PATH = path.join(__dirname, '..', DB_PATH)
}
const db = new DatabaseSync(DB_PATH)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

module.exports = db
