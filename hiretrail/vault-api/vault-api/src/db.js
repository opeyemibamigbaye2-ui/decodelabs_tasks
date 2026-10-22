// Pillar 2: The Bridge (native driver connection)
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(process.env.DB_FILE || path.join(__dirname, '..', 'vault.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // SQLite ignores foreign keys unless enabled
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

module.exports = db;
