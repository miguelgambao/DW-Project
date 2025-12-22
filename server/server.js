const http = require("http");
const {MongoClient} = require("mongodb");
const fs = require("fs");
const path = require("path");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

// --- Helpers ---
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk.toString()));
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
        req.on("error", reject);
    });
}

function getContentType(ext) {
    switch (ext) {
        case ".html":
            return "text/html";
        case ".js":
            return "application/javascript";
        case ".css":
            return "text/css";
        case ".svg":
            return "image/svg+xml";
        case ".json":
            return "application/json";
        default:
            return "text/plain";
    }
}

async function startServer() {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    console.log("Connected to MongoDB");

    const server = http.createServer(async (req, res) => {
        // --- CORS ---
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            const {method, url: reqUrl, headers} = req;

            // --- API ROUTES ---
            if (method === "POST" && reqUrl === "/api/login") {
                const {email, password} = await parseBody(req);
                const user = await db.collection("users").findOne({
                    username: email.trim().toLowerCase(),
                    password: password.trim(),
                });
                if (user) res.end(JSON.stringify({userId: user._id}));
                else res.writeHead(401).end(JSON.stringify({userId: null, error: "Invalid credentials"}));
                return;
            }

            if (method === "POST" && reqUrl === "/api/register") {
                const {email, password} = await parseBody(req);
                const normalizedUsername = email.trim().toLowerCase();
                const existing = await db.collection("users").findOne({username: normalizedUsername});
                if (existing) {
                    res.writeHead(409);
                    res.end(JSON.stringify({error: "User exists"}));
                    return;
                }
                const result = await db.collection("users").insertOne({username: normalizedUsername, password});
                res.writeHead(201).end(JSON.stringify({userId: result.insertedId}));
                return;
            }

            if (method === "GET" && reqUrl === "/users") {
                const users = await db.collection("users").find({}).toArray();
                res.end(JSON.stringify(users));
                return;
            }

            if (method === "GET" && reqUrl.startsWith("/tasks")) {
                const urlObj = new URL(reqUrl, `http://${headers.host}`);
                const userEmail = urlObj.searchParams.get("user_email");
                const page = parseInt(urlObj.searchParams.get("page")) || 1;
                const completed = urlObj.searchParams.get("completed");

                const limit = 10;
                const skip = (page - 1) * limit;

                if (!userEmail) {
                    res.writeHead(400);
                    res.end(JSON.stringify({error: "Missing user_email"}));
                    return;
                }

                const query = {user_email: userEmail};

                if (completed !== null) {
                    query.completed = completed === "true";
                }

                const tasks = await db
                .collection("tasks")
                .find(query)
                .sort({due_date: 1})
                .skip(skip)
                .limit(limit)
                .toArray();

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(tasks));
                return;
            }

            if (method === "PATCH" && reqUrl === "/tasks/toggle") {
                const {taskId, completed} = await parseBody(req);

                if (!taskId || typeof completed !== "boolean") {
                    res.writeHead(400);
                    res.end(JSON.stringify({error: "Invalid data"}));
                    return;
                }

                await db.collection("tasks").updateOne(
                    {_id: taskId},
                    {
                        $set: {
                            completed,
                            updated_at: new Date().toISOString().split("T")[0],
                        },
                    }
                );

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: true}));
                return;
            }

            if (method === "POST" && reqUrl === "/tasks") {
                const data = await parseBody(req);

                if (!data.title || !data.user_email || !data.due_date) {
                    res.writeHead(400);
                    res.end(JSON.stringify({error: "Missing required fields"}));
                    return;
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

                res.writeHead(201, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: true, id: result.insertedId}));
                return;
            }

            if (method === "POST" && reqUrl === "/calendar-events") {
                const data = await parseBody(req);
                const event = {
                    title: data.title,
                    description: data.description,
                    start_time: data.start_time,
                    end_time: data.end_time,
                    all_day: data.all_day,
                    user_email: data.user_email,
                };
                const result = await db.collection("events").insertOne(event);
                res.writeHead(201, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: true, id: result.insertedId}));
                return;
            }

            if (method === "GET" && reqUrl.startsWith("/calendar-events")) {
                const urlObj = new URL(reqUrl, `http://${headers.host}`);
                const userEmail = urlObj.searchParams.get("user_email");
                const weekStart = urlObj.searchParams.get("week_start");
                const weekEnd = urlObj.searchParams.get("week_end");

                if (!userEmail || !weekStart || !weekEnd) {
                    res.writeHead(400, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({error: "Missing parameters"}));
                    return;
                }

                const events = await db
                .collection("events")
                .find({
                    user_email: userEmail,
                    $expr: {
                        $or: [
                            {
                                $and: [
                                    {$gte: [{$toDate: "$start_time"}, new Date(weekStart)]},
                                    {$lte: [{$toDate: "$start_time"}, new Date(weekEnd)]},
                                ],
                            },
                            {
                                $and: [
                                    {$gte: [{$toDate: "$end_time"}, new Date(weekStart)]},
                                    {$lte: [{$toDate: "$end_time"}, new Date(weekEnd)]},
                                ],
                            },
                            {
                                $and: [
                                    {$lte: [{$toDate: "$start_time"}, new Date(weekStart)]},
                                    {$gte: [{$toDate: "$end_time"}, new Date(weekEnd)]},
                                ],
                            },
                        ],
                    },
                })
                .toArray();

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(events));
                return;
            }

            // --- STATIC FILES ---
            let filePath = reqUrl === "/" ? "index.html" : reqUrl.slice(1);
            filePath = path.join(__dirname, filePath);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath);
                res.writeHead(200, {"Content-Type": getContentType(ext)});
                res.end(fs.readFileSync(filePath));
                return;
            }

            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("Not found");
        } catch (err) {
            console.error(err);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: "Internal server error"}));
        }
    });

    server.listen(3000, "0.0.0.0", () => {
        console.log("Server running on http://0.0.0.0:3000");
    });
}

startServer().catch((err) => console.error(err));
