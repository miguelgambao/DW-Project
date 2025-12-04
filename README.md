# DW-Project

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

## Run

- Start the HTTP server (API):

```bash
node server/server.js
```

The server listens on `http://localhost:3000` (see `server/server.js`).

- Start the Electron app (desktop UI):

```bash
npm start
```

Note: `npm start` runs `electron main.js` (see `package.json`).

## API

- `GET /users` — returns all users from the `users` collection (used by the renderer for demo data).

```
