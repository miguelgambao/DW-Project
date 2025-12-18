const http = require("http");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } 
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

function getContentType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.svg': return 'image/svg+xml';
    case '.json': return 'application/json';
    default: return 'text/plain';
  }
}

async function startServer() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  console.log("Connected to MongoDB");

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // --- Rotas da API ---
      if (req.method === "POST" && req.url === "/api/login") {
        const { email, password } = await parseBody(req);
        const user = await db.collection("users").findOne({
          username: email.trim().toLowerCase(),
          password: password.trim()
        });
        if (user) res.end(JSON.stringify({ userId: user._id }));
        else res.writeHead(401).end(JSON.stringify({ userId: null, error: "Invalid credentials" }));
        return;
      }

      if (req.method === "POST" && req.url === "/api/register") {
        const { email, password } = await parseBody(req);
        const normalizedUsername = email.trim().toLowerCase();
        const existing = await db.collection("users").findOne({ username: normalizedUsername });
        if (existing) { res.writeHead(409); res.end(JSON.stringify({ error: "User exists" })); return; }
        const result = await db.collection("users").insertOne({ username: normalizedUsername, password });
        res.writeHead(201).end(JSON.stringify({ userId: result.insertedId }));
        return;
      }

      if (req.method === "GET" && req.url === "/users") {
        const users = await db.collection("users").find({}).toArray();
        res.end(JSON.stringify(users));
        return;
      }

      if (req.method === "GET" && req.url.startsWith("/tasks")) {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const userEmail = urlObj.searchParams.get("user_email");
        if (!userEmail) { res.writeHead(400); res.end(JSON.stringify({ error: "Missing user_email" })); return; }
        const tasks = await db.collection("tasks").find({ user_email: userEmail }).toArray();
        res.end(JSON.stringify(tasks));
        return;
      }

      // --- Servir arquivos estáticos ---
      let filePath = req.url === '/' ? 'index.html' : req.url.slice(1); // remove o /
      filePath = path.join(__dirname, filePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': getContentType(ext) });
        res.end(fs.readFileSync(filePath));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');

    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });

  server.listen(3000, '0.0.0.0', () => {
    console.log("Server running on http://0.0.0.0:3000");
  });
}

startServer().catch(err => console.error(err));
