export function RegisterUI() {
    const formTitle = document.getElementById("form-title");
    const registerButton = document.getElementById("registerButton");
    const loginButton = document.getElementById("loginButton");

    let isRegisterMode = false;

    registerButton.addEventListener("click", () => {
        isRegisterMode = !isRegisterMode;

        formTitle.textContent = isRegisterMode ? "Register" : "Login";
        loginButton.textContent = isRegisterMode ? "Register" : "Login";
        registerButton.textContent = isRegisterMode ? "Login" : "Register";
    });

    return {
        isRegisterMode: () => isRegisterMode,
        setLoginMode: () => {
            isRegisterMode = false;
            formTitle.textContent = "Login";
            loginButton.textContent = "Login";
            registerButton.textContent = "Register";
        },
    };
}
