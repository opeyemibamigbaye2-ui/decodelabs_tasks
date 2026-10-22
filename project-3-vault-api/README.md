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


## Browser UI

A simple web page is included for using the API without typing commands.

1. Start the server from the project folder:

   npm start

2. Open http://localhost:3000 in your browser.

From the page you can:

- Add, edit and delete users (validation errors such as age under 18 or a duplicate email are shown in a red message)
- Select a user with the Notes button to add, edit and delete that user's notes
- Delete a user, which also deletes their notes (cascade delete)

The page lives in public/index.html and is served by Express using express.static. It talks to the same REST endpoints as the API, so everything it does is stored in vault.db.

## Frontend and backend integration

The browser page (public/index.html) talks to the REST API using the fetch API with async/await.

- Requests: fetch sends POST, GET, PUT and DELETE requests with JSON bodies and a Content-Type header.
- Dynamic data: the user and note lists are built from the JSON the server returns, using textContent so user input is never injected as HTML.
- Error handling: every request runs inside try/catch/finally. The code checks response.ok, shows the server's validation message (400, 409) in a red banner, and shows "Cannot reach the server" if the backend is down. A loading indicator is shown while a request is running and hidden in the finally block.
- No CORS setup is needed because Express serves the page and the API from the same address.