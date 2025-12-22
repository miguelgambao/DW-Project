const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

async function loginUser(username, password) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("pomodoro_app");

    const user = await db.collection("users").findOne({
      username: username.trim().toLowerCase(),
      password: password.trim()
    });

    return user ? user._id : null;
  } finally {
    await client.close();
  }
}

async function createUser(username, password) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("pomodoro_app");

    const normalizedUsername = username.trim().toLowerCase();

    const existing = await db.collection("users").findOne({ username: normalizedUsername });
    if (existing) return null;

    const result = await db.collection("users").insertOne({
      username: normalizedUsername,
      password: password.trim()
    });

    return result.insertedId;
  } finally {
    await client.close();
  }
}

module.exports = { createUser, loginUser };
