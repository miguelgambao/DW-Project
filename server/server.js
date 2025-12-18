const http = require("http");
const {MongoClient} = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
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
            if (req.method === "POST" && req.url === "/api/login") {
                const { email, password } = await parseBody(req);
                
                const user = await db.collection("users").findOne({
                    username: email.trim().toLowerCase(),
                    password: password.trim()
                });

                if (user) {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({ userId: user._id }));
                } else {
                    res.writeHead(401, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({ userId: null, error: "Invalid credentials" }));
                }
                return;
            }

            if (req.method === "POST" && req.url === "/api/register") {
                const { email, password } = await parseBody(req);
                
                const normalizedUsername = email.trim().toLowerCase();
                const existing = await db.collection("users").findOne({ username: normalizedUsername });
                
                if (existing) {
                    res.writeHead(409, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({ userId: null, error: "User already exists" }));
                    return;
                }

                const result = await db.collection("users").insertOne({
                    username: normalizedUsername,
                    password: password.trim()
                });

                res.writeHead(201, {"Content-Type": "application/json"});
                res.end(JSON.stringify({ userId: result.insertedId }));
                return;
            }

            if (req.method === "GET" && req.url === "/users") {
                const users = await db.collection("users").find({}).toArray();
                console.log("Users fetched from MongoDB:", users);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(users));
                return;
            }

            if (req.method === "GET" && req.url.startsWith("/tasks")) {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
                const userEmail = urlObj.searchParams.get("user_email");

                if (!userEmail) {
                    res.writeHead(400, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({error: "Missing user_email parameter"}));
                    return;
                }

                const tasks = await db.collection("tasks").find({user_email: userEmail}).toArray();
                console.log(`Tasks for ${userEmail}:`, tasks);

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(tasks));
                return;
            }

            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Not found");
        } catch (err) {
            console.error("Server error:", err);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "Internal server error"}));
        }
    });

    server.listen(3000, '0.0.0.0', () => {
    console.log("Server running on http://0.0.0.0:3000");
});
}

startServer().catch((err) => console.error("Failed to start server:", err));
