const {MongoClient} = require("mongodb");

const url = "mongodb://localhost:27017";
const dbName = "pomodoro_app";

const withDB = async (fn) => {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);

    return fn(db).finally(() => client.close());
};

const loginUser = (username, password) =>
    withDB((db) =>
        db
        .collection("users")
        .findOne({
            username: username.trim().toLowerCase(),
            password: password.trim(),
        })
        .then((user) => (user ? user._id : null))
    );

const createUser = (username, password) =>
    withDB((db) => {
        const normalizedUsername = username.trim().toLowerCase();

        return db
        .collection("users")
        .findOne({username: normalizedUsername})
        .then((existing) => {
            if (existing) return null;

            return db
            .collection("users")
            .insertOne({
                username: normalizedUsername,
                password: password.trim(),
            })
            .then((res) => res.insertedId);
        });
    });

const getUser = (username) =>
    withDB((db) =>
        db.collection("users").findOne({
            username: username.trim().toLowerCase(),
        })
    );

const updatePassword = (username, password) =>
    withDB((db) =>
        db.collection("users").updateOne({username: username.trim().toLowerCase()}, {$set: {password: password.trim()}})
    ).then(() => true);

module.exports = {
    loginUser,
    createUser,
    getUser,
    updatePassword,
};
