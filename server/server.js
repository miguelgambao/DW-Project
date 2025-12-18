const http = require("http");
const {MongoClient} = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

async function startServer() {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    console.log("Connected to MongoDB");

    const server = http.createServer(async (req, res) => {
        try {
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

            if (req.method === "GET" && req.url.startsWith("/calendar-events")) {
                const urlObj = new URL(req.url, `http://${req.headers.host}`);
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

                console.log(`Calendar events for ${userEmail} (${weekStart} → ${weekEnd}):`, events);

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(events));
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

    server.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

startServer().catch((err) => console.error("Failed to start server:", err));
