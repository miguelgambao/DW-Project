const http = require("http");
const {MongoClient, ObjectId} = require("mongodb");
const fs = require("fs");
const path = require("path");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
        req.on("error", reject);
    });
}

function getContentType(ext) {
    return (
        {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".woff2": "font/woff2",
            ".json": "application/json",
        }[ext] || "text/plain"
    );
}

async function startServer() {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    console.log("Connected to MongoDB");

    const STATIC_CLIENT_DIR = path.join(__dirname, "..", "client");
    const STATIC_ASSETS_DIR = path.join(__dirname, "..", "assets");

    const server = http.createServer(async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            res.writeHead(200);
            return res.end();
        }

        const {method, url: reqUrl, headers} = req;

        try {
            if (method === "POST" && reqUrl === "/api/login") {
                const {email, password} = await parseBody(req);
                const user = await db.collection("users").findOne({
                    username: email.trim().toLowerCase(),
                    password: password.trim(),
                });

                if (!user) {
                    res.writeHead(401);
                    return res.end(JSON.stringify({error: "Invalid credentials"}));
                }

                return res.end(JSON.stringify({userId: user._id}));
            }

            if (method === "POST" && reqUrl === "/api/register") {
                const {email, password} = await parseBody(req);
                const username = email.trim().toLowerCase();

                if (await db.collection("users").findOne({username})) {
                    res.writeHead(409);
                    return res.end(JSON.stringify({error: "User exists"}));
                }

                const result = await db.collection("users").insertOne({username, password});
                res.writeHead(201);
                return res.end(JSON.stringify({userId: result.insertedId}));
            }

            if (method === "GET" && reqUrl === "/users") {
                const users = await db.collection("users").find({}).toArray();
                return res.end(JSON.stringify(users));
            }

            if (method === "GET" && (reqUrl === "/tasks" || reqUrl.startsWith("/tasks?"))) {
                const urlObj = new URL(reqUrl, `http://${headers.host}`);
                const userEmail = urlObj.searchParams.get("user_email");

                if (!userEmail) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({error: "Missing user_email"}));
                }

                const tasks = await db.collection("tasks").find({user_email: userEmail}).toArray();
                return res.end(JSON.stringify(tasks));
            }

            if (method === "POST" && reqUrl === "/tasks") {
                const data = await parseBody(req);

                if (!data.title || !data.user_email) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({error: "Missing required fields: title and user_email"}));
                }

                const now = new Date().toISOString().split("T")[0];

                const task = {
                    title: data.title,
                    description: data.description || "",
                    due_date: data.due_date,
                    due_time: data.due_time || "",
                    created_at: now,
                    updated_at: now,
                    completed: false,
                    user_email: data.user_email,
                };

                const result = await db.collection("tasks").insertOne(task);
                res.writeHead(201);
                return res.end(JSON.stringify({id: result.insertedId}));
            }

            if (method === "PATCH" && reqUrl === "/tasks/toggle") {
                const {taskId, completed} = await parseBody(req);

                if (!taskId) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({error: "Missing taskId"}));
                }

                try {
                    await db
                    .collection("tasks")
                    .updateOne(
                        {_id: new ObjectId(taskId)},
                        {$set: {completed, updated_at: new Date().toISOString().split("T")[0]}}
                    );

                    return res.end(JSON.stringify({success: true}));
                } catch (error) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({error: "Invalid taskId format"}));
                }
            }

            if (method === "POST" && reqUrl === "/calendar-events") {
                const event = await parseBody(req);
                const result = await db.collection("events").insertOne(event);
                res.writeHead(201);
                return res.end(JSON.stringify({id: result.insertedId}));
            }

            if (method === "GET" && reqUrl.startsWith("/calendar-events")) {
                const urlObj = new URL(reqUrl, `http://${headers.host}`);
                const userEmail = urlObj.searchParams.get("user_email");
                const weekStart = new Date(urlObj.searchParams.get("week_start"));
                const weekEnd = new Date(urlObj.searchParams.get("week_end"));

                const events = await db
                .collection("events")
                .find({
                    user_email: userEmail,
                    start_time: {$lte: weekEnd},
                    end_time: {$gte: weekStart},
                })
                .toArray();

                return res.end(JSON.stringify(events));
            }

            if (reqUrl.startsWith("/users/") && !reqUrl.endsWith(".js") && !reqUrl.endsWith(".css")) {
                if (method === "GET") {
                    const urlPath = reqUrl.split("?")[0]; 
                    const username = decodeURIComponent(urlPath.split("/")[2] || "").trim().toLowerCase();

                    if (!username) {
                        res.writeHead(400, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({error: "Username is required"}));
                    }

                    const user = await db.collection("users").findOne({username});

                    if (!user) {
                        res.writeHead(404, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({error: "User not found"}));
                    }

                    res.writeHead(200, {"Content-Type": "application/json"});
                    return res.end(
                        JSON.stringify({
                            username: user.username,
                        })
                    );
                }

                if (method === "PATCH") {
                    const urlPath = reqUrl.split("?")[0];
                    const username = decodeURIComponent(urlPath.split("/")[2] || "").trim().toLowerCase();
                    const {password} = await parseBody(req);

                    if (!password) {
                        res.writeHead(400, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({error: "Password is required"}));
                    }

                    const result = await db.collection("users").updateOne({username}, {$set: {password: password.trim()}});

                    if (result.matchedCount === 0) {
                        res.writeHead(404, {"Content-Type": "application/json"});
                        return res.end(JSON.stringify({error: "User not found"}));
                    }

                    res.writeHead(200, {"Content-Type": "application/json"});
                    return res.end(JSON.stringify({success: true}));
                }
            }

            let filePath;
            if (reqUrl === "/" || reqUrl === "/index.html") {
                filePath = path.join(STATIC_CLIENT_DIR, "index.html");
            } else if (reqUrl.startsWith("/assets/")) {
                filePath = path.join(STATIC_ASSETS_DIR, reqUrl.replace("/assets/", ""));
            } else {
                filePath = path.join(STATIC_CLIENT_DIR, reqUrl.slice(1));
            }

            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath);
                res.writeHead(200, {"Content-Type": getContentType(ext)});
                return res.end(fs.readFileSync(filePath));
            }

            res.writeHead(404);
            res.end("Not found");
        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.end(JSON.stringify({error: "Internal server error"}));
        }
    });

    server.listen(8080, "0.0.0.0", () => console.log("Server running on http://0.0.0.0:8080"));
}

startServer().catch(console.error);
