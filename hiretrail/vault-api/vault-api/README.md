# Vault API — Project 3: Database Integration

Node.js + Express + SQLite (`better-sqlite3`, a native driver using raw SQL).

## Run
    npm install
    npm start            # http://localhost:3000
    ./test.sh            # smoke test (server must be running)

## Schema (`src/schema.sql`)
- `users(id PK, name NOT NULL, email UNIQUE NOT NULL, age CHECK >= 18, created_at)`
- `notes(id PK, user_id FK -> users.id ON DELETE CASCADE, title NOT NULL, content, created_at, updated_at)`
- One-to-many: one user has many notes.

## Endpoints (CRUD <-> HTTP <-> SQL)
| CRUD   | HTTP                         | SQL    |
|--------|------------------------------|--------|
| Create | POST /users, POST /users/:id/notes | INSERT |
| Read   | GET /users, /users/:id, /users/:id/notes, /notes/:id | SELECT |
| Update | PUT or PATCH /users/:id, PUT /notes/:id | UPDATE |
| Delete | DELETE /users/:id, /notes/:id | DELETE |

## Data handling / security
- Every query is parameterized (`?` placeholders): no string concatenation, so no SQL injection.
- Integrity enforced in the schema (UNIQUE, NOT NULL, CHECK, FOREIGN KEY), not just app code.
- `PRAGMA foreign_keys = ON` (SQLite disables FKs by default).
- Input validated; correct status codes: 201, 204, 400, 404, 409 (duplicate email).
