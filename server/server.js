const http = require('http');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'pomodoro_app';

async function startServer() {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);
    console.log('Connected to MongoDB');

    const server = http.createServer(async (req, res) => {
        if (req.method === 'GET' && req.url === '/users') {
            try {
                const users = await db.collection('users').find({}).toArray();
                console.log('Users fetched from MongoDB:', users);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(users));
            } catch (err) {
                res.writeHead(500);
                res.end('Error fetching users');
            }
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });

    server.listen(3000, () => {
        console.log('Server running on http://localhost:3000');
    });
}

startServer().catch(err => console.error('Failed to start server:', err));
