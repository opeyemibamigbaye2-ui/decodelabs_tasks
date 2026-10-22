# DecodeLabs Tasks: Full Stack Development

Submitted by Bamigbaye Opeyemi Chimdindu, Full Stack Development Intern at DecodeLabs.

| Task | Folder | What it is |
|---|---|---|
| 1. Responsive Frontend | [`project-1-responsive-frontend`](project-1-responsive-frontend) | HireTrail, a job application tracker built with HTML, CSS and vanilla JavaScript |
| 2. Backend API | [`project-2-backend-api`](project-2-backend-api) | REST API (Node.js and Express) with validation, semantic status codes and 35 automated tests |
| 3. Database Integration | [`project-3-vault-api`](project-3-vault-api) | Node.js, Express and SQLite app with users and notes: validation, duplicate-email checks and cascade delete |
| 4. Frontend and Backend Integration | [`project-3-vault-api/public`](project-3-vault-api/public) | The Vault API's browser UI, served by the same Express server. It talks to the API with `fetch` and `async/await` |

**Live demo (Project 1):** https://opeyemibamigbaye2-ui.github.io/hiretrail/

## Note on Task 4

Task 4 is the browser interface that ships with the Vault API (`project-3-vault-api/public/index.html`), not a separate application. It meets the Project 4 requirements:

- **Send requests from the frontend to the backend:** `fetch` sends POST, GET, PUT and DELETE requests with JSON bodies and a `Content-Type` header.
- **Display dynamic data:** the user and note lists are built from the JSON the server returns, using `textContent`.
- **Handle errors and responses:** every request runs in `try/catch/finally`, checks `response.ok`, shows the server's 400 and 409 validation messages in a banner, shows a message when the server can't be reached, and hides the loading indicator in `finally`.

## Running a project

Each folder has its own README with setup steps. For the Node projects, run `npm install` and then `npm start` inside the folder.

## Tools

HTML5, CSS3, JavaScript, Node.js, Express, SQLite
