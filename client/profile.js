export async function showProfile(username) {
    const contentSection = document.querySelector("section.content")
    const title = document.querySelector(".general-title")

    title.textContent = "Profile"

    const res = await fetch(
        `http://localhost:8080/users/${encodeURIComponent(username)}`
    )
    if (!res.ok) return alert("Failed to load profile")

    const user = await res.json()

    contentSection.innerHTML = `
        <div class="profile-section">
            <div>
                <div class="profile-field">
                    <label>Email</label>
                    <input
                        type="text"
                        class="input-primary"
                        value="${user.username}"
                        disabled
                    />
                </div>

                <div class="profile-field">
                    <label>Password</label>
                    <input
                        type="password"
                        id="profile-password"
                        class="input-primary"
                        placeholder="New password"
                    />
                </div>

                <button class="button-primary Smaller" id="save-btn">Save</button>
            </div>
        </div>

        <button class="button-primary error" id="logout-btn">Log out</button>
    `

    document.getElementById("save-btn").addEventListener("click", async () => {
        const newPassword = document.getElementById("profile-password").value
        if (!newPassword) return alert("Password cannot be empty")

        const res = await fetch(
            `http://localhost:8080/users/${encodeURIComponent(username)}`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword })
            }
        )
        res.ok 
            ? (alert("Password updated successfully"), document.getElementById("profile-password").value = "") 
            : alert("Failed to update password")
    })

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser")
        window.location.reload()
    })
}
