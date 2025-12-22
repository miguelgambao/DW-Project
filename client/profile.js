export function showProfile(username) {
    const contentSection = document.querySelector("section.content")
    const title = document.querySelector(".general-title")

    title.textContent = "Profile"

    fetch(`http://localhost:3000/users/${encodeURIComponent(username)}`)
        .then(res => res.ok ? res.json() : Promise.reject("Failed to load profile"))
        .then(user => {
            contentSection.innerHTML = `
                <div class="profile-section">
                    <div>
                        <div class="profile-field">
                            <label>Email</label>
                            <input type="text" class="input-primary" value="${user.username}" disabled />
                        </div>
                        <div class="profile-field">
                            <label>Password</label>
                            <input type="password" id="profile-password" class="input-primary" placeholder="New password" />
                        </div>
                        <button class="button-primary Smaller" id="save-btn">Save</button>
                    </div>
                </div>
                <button class="button-primary error" id="logout-btn">Log out</button>
            `

            document.getElementById("save-btn").addEventListener("click", () => {
                const newPassword = document.getElementById("profile-password").value
                if (!newPassword) return alert("Password cannot be empty")

                if (window.api && window.api.isElectron) {
                    window.api.updatePassword(username, newPassword)
                        .then(() => {
                            alert("Password updated successfully")
                            document.getElementById("profile-password").value = ""
                        })
                        .catch(err => alert("Error: " + err.message))
                } else {
                    fetch(`http://localhost:3000/users/${encodeURIComponent(username)}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ password: newPassword })
                    })
                        .then(res => res.ok ? res.json() : Promise.reject("Failed to update password"))
                        .then(() => {
                            alert("Password updated successfully")
                            document.getElementById("profile-password").value = ""
                        })
                        .catch(err => alert("Error: " + err))
                }
            })

            document.getElementById("logout-btn").addEventListener("click", () => {
                localStorage.removeItem("loggedInUser")
                window.location.reload()
            })
        })
        .catch(err => alert(err))
}
