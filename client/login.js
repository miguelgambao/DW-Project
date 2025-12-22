const SERVER_URL = "http://localhost:8080";

async function loginUser(username, password) {
  const res = await fetch(`${SERVER_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password })
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.userId || null;
}

async function createUser(username, password) {
  const res = await fetch(`${SERVER_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password })
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.userId || null;
}

module.exports = { createUser, loginUser };
