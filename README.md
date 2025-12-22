# DW-Project

## Project Description

Pomodoro productivity app with tasks, calendar events, a dashboard with insights, and a simple Electron desktop client backed by a Node.js + MongoDB API.

![App Screenshot](assets/media/app-screenshot.png)

## Prerequisites

- Node.js and npm — verify with `node -v` and `npm -v`
- MongoDB Community Server (local instance)
  - macOS (Homebrew):
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    brew services start mongodb-community@7.0
    ```
  - Windows / Linux: install MongoDB Community from the official packages or your package manager.

## Install

1. Clone the repository and open the project root (where `package.json` is located).
2. Install dependencies:

```bash
npm install
```

The main dependencies are `electron` and `mongodb` (used by the server).

## Configuration

- Copy [client/config.example.js](client/config.example.js) to [client/config.js](client/config.js).
- Set `isDevelopment` according to where the API lives:
  - `true` → local API at `http://localhost:8080`
  - `false` → live server at `http://10.17.0.28:8080`

The frontend uses `API_CONFIG.BASE_URL` for all fetch calls.

# Start MongoDB (before seeding)

Make sure a MongoDB server is running on `localhost:27017` before importing the seed files.

- macOS (Homebrew managed):

```bash
brew services start mongodb-community@7.0
# to stop:
brew services stop mongodb-community@7.0
```

- Run `mongod` directly:

```bash
# default: starts a server on port 27017 with the default data directory
mongod --config /usr/local/etc/mongod.conf
```

- Linux (systemd):

```bash
sudo systemctl start mongod
# to stop:
sudo systemctl stop mongod
```

- Windows (if installed as a service):

```powershell
net start MongoDB
# or run 'mongod' from the installation bin folder to start in a console
```

## Seed the database

Seed data files are in the `seed-data/` folder. To import them into a local MongoDB database named `pomodoro_app`, use `mongoimport` (part of MongoDB tools):

```bash
# Import users
mongoimport --db pomodoro_app --collection users --file seed-data/users.json --jsonArray

# Import tasks
mongoimport --db pomodoro_app --collection tasks --file seed-data/tasks.json --jsonArray

# Import pomodoro sessions
mongoimport --db pomodoro_app --collection pomodoro_sessions --file seed-data/pomodoro_sessions.json --jsonArray

# Import events
mongoimport --db pomodoro_app --collection events --file seed-data/events.json --jsonArray
```

By default the server connects to `mongodb://localhost:27017` and uses the `pomodoro_app` database.
 
### Seed helper scripts (optional)

Save these as files under a `scripts/` folder if you prefer one-command import/export. These scripts assume local MongoDB on `mongodb://localhost:27017` and operate on the `pomodoro_app` database.

Import script (`scripts/import_seed.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

DB="pomodoro_app"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
SEED_DIR="$ROOT_DIR/seed-data"

echo "Importing seed data into $MONGO_URI/$DB..."

mongoimport --uri "$MONGO_URI" --db "$DB" --collection users --file "$SEED_DIR/users.json" --jsonArray --drop
mongoimport --uri "$MONGO_URI" --db "$DB" --collection tasks --file "$SEED_DIR/tasks.json" --jsonArray --drop
mongoimport --uri "$MONGO_URI" --db "$DB" --collection pomodoro_sessions --file "$SEED_DIR/pomodoro_sessions.json" --jsonArray --drop
mongoimport --uri "$MONGO_URI" --db "$DB" --collection events --file "$SEED_DIR/events.json" --jsonArray --drop

echo "Done."
```

Export script (`scripts/export_db.sh`) using `mongoexport`:

```bash
#!/usr/bin/env bash
set -euo pipefail

DB="pomodoro_app"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
OUT_DIR="$ROOT_DIR/seed-data"

mkdir -p "$OUT_DIR"

echo "Exporting $MONGO_URI/$DB to $OUT_DIR..."

mongoexport --uri "$MONGO_URI" --db "$DB" --collection users --out "$OUT_DIR/users.json" --jsonArray
mongoexport --uri "$MONGO_URI" --db "$DB" --collection tasks --out "$OUT_DIR/tasks.json" --jsonArray
mongoexport --uri "$MONGO_URI" --db "$DB" --collection pomodoro_sessions --out "$OUT_DIR/pomodoro_sessions.json" --jsonArray
mongoexport --uri "$MONGO_URI" --db "$DB" --collection events --out "$OUT_DIR/events.json" --jsonArray

echo "Done."
```

## Run

The application can run in two modes: **Electron (Desktop)** or **Web Browser**.

### Prerequisites for Both Modes

Make sure the HTTP server (API) is running first:

```bash
npm run server
# or
node server/server.js
```

The server listens on `http://localhost:8080`.

### Electron Mode (Desktop App)

```bash
npm start
# or
npm run start:electron
```

This launches the Electron desktop application.

### Web Browser Mode

2. Open your browser and navigate to:
```
http://localhost:8080
```

**Note:** The app communicates with the backend via `API_CONFIG.BASE_URL` (default `http://localhost:8080`). To auto-connect to the live server in Electron, set `isDevelopment` to false in [client/config.js](client/config.js).

## Contributions

| Student | Area | Summary |
|--------|------|---------|
| Student A | Backend | Implemented HTTP server and users/tasks APIs |
| Student B | Frontend Tasks | Built tasks table, modal, toggle states |
| Student C | Calendar | Week events loader and UI integration |
| Student D | Dashboard | Upcoming tasks and pie chart visualization |
| Student E | Auth/UI | Login/Register screens and Profile page |

Replace rows with actual student names and contributions.

## API

 - `POST /api/login` — login with `email` + `password`
 - `POST /api/register` — register with `email` + `password`
 - `GET /users` — list users
 - `PATCH /users/:username` — update user password
 - `GET /tasks?user_email=...` — list tasks for a user
 - `POST /tasks` — create task
 - `PATCH /tasks/toggle` — toggle task completion
 - `GET /calendar-events?user_email=...&week_start=...&week_end=...` — list events for a week
 - `POST /calendar-events` — create event

```
